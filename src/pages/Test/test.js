// ==UserScript==
// @name         IdleMMO
// @namespace    http://tampermonkey.net/
// @version      2024-01-06
// @description  try to do the least amount of work to win
// @author       You
// @match        https://web.idle-mmo.com/*
// @icon         https://cdn.idle-mmo.com/cdn-cgi/image/height=250,width=250/global/logo.png
// @grant        none
// @require      http://code.jquery.com/jquery-3.7.1.min.js
// ==/UserScript==

(function () {
	'use strict';

	/* global $ */
	const autoGame = {};

	const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
	const getFirstButtonAvailableInList = (list) => {
		let firstClicked = false;
		for (let item in list) {
			if (firstClicked) break;
			if (list[item].nodeName) {
				let button = list[item];
				let isBlocked = button.getElementsByClassName('text-red-400');
				if (isBlocked.length === 0) {
					firstClicked = button;
				}
			}
		}
		return firstClicked;
	};
	const checkIfDoingSomething = () => {
		let loading = $('main > div:first-child > div:first-child > div:first-child .animate-spin');
		return loading.length !== 0;
	};
	const waitTillDoneDoingSomething = async (time = 30000) => {
		while (checkIfDoingSomething()) {
			console.info(`Still working, waiting ${time / 1000} seconds`);
			await sleep(time);
		}
	};
	const ls = {
		get: (key) => localStorage.getItem(key),
		set: (key, value) => localStorage.setItem(key, value),
		delete: (key) => localStorage.removeItem(key),
		// get: (key) => GM_setValue.getItem(key),
		// set: (key, value) => GM_setValue.setItem(key, value),
		// delete: (key) => GM_deleteValue.removeItem(key),
		autoStart: 'auto-start',
		nextLocation: 'next-location',
		dungeonDive: 'dungeon-dive',
		coalMining: 'coal-mining',
	};
	const locations = {
		inventory: '/inventory',
		smelting: '/skills/view/smelting',
		forge: '/skills/view/forge',
		mining: '/skills/view/mining',
		woodcutting: '/skills/view/woodcutting',
		battle: '/battle',
		alchemy: '/skills/view/alchemy',
		fishing: '/skills/view/fishing',
		cooking: '/skills/view/cooking',
	};

	const clickFirstAvailable = async (reverse = false) => {
		let buttonsList = [];
		let list = $('#game-container div >  ul > button');
		list.map((item) => buttonsList.push(list[item]));
		console.log(buttonsList);
		if (reverse) {
			buttonsList.reverse();
		}
		const firstItem = getFirstButtonAvailableInList(buttonsList);
		if (!firstItem) return false;
		firstItem.click();
		await sleep(500);
		return true;
	};
	const addCrystalIfThere = async () => {
		const crystalButton = $("button:contains('No Crystal')");
		if (crystalButton.length === 0) return;
		crystalButton.click();
		await sleep(500);
		$('.min-h-full .mb-6 > button').click();
		await sleep(500);
	};

	const craftFirstAvailableItem = async (reverse = false) => {
		const clicked = await clickFirstAvailable(reverse);
		if (!clicked) return clicked;
		// add crystal if there
		await addCrystalIfThere();
		// Click the max button and start crafting.
		$("button:contains('Max')").click();
		await sleep(500);
		$("button:contains('Start')").click();
		return true;
	};

	const startFirstAvailableItem = async (reverse = false) => {
		const clicked = await clickFirstAvailable(reverse);
		if (!clicked) return clicked;
		// add crystal if there
		await addCrystalIfThere();
		// Click the start button
		$("button:contains('Start')").click();
		return true;
	};

	const checkBossBattle = async () => {
		// refresh page every 2 minutes if Boss is starting in less than an hour
		const bossTimeLeft = $(
			'#game-container > div:first-child > div:first-child + div > div:first-child > div:first-child > div:first-child + div + div + div button.rounded-lg div span',
		)[0].innerHTML;
		if (!bossTimeLeft.includes('h')) {
			console.log('BBBB Boss Time Left: ', bossTimeLeft);
		}
		let timeLeft = 120000;
		switch (true) {
			case bossTimeLeft.includes('h'):
				timeLeft = parseInt(bossTimeLeft.split('h')[0]) * 60000;
				break;
			case bossTimeLeft.includes('m'):
				timeLeft = parseInt(bossTimeLeft.split('m')[0] * 60000);
				break;
			case bossTimeLeft.includes('s'):
				timeLeft = parseInt(bossTimeLeft.split('s')[0] * 1000);
				break;
			default:
				timeLeft = 120000;
				break;
		}
		if (new Date() - autoGame.startTime > timeLeft) {
			window.location.reload();
		}

		// First check to see if there is a boss battle to participate in.
		const startBossBattle = $("span:contains('Now')");
		if (startBossBattle.length !== 0) {
			console.log('BBBB fighting boss');
			startBossBattle.click();
			await sleep(500);
			$("span:contains('Join Lobby')").click();
			return true;
		}
		return timeLeft;
	};

	const startBattle = async () => {
		const joined = await checkBossBattle();
		await waitTillDoneDoingSomething(10000);
		if (joined === true) return true;
		// Check if there are monsters to battle
		// const availableBattles = $(
		// 	'#game-container > div:first-child > div:first-child + div > div:first-child > div:first-child > div:first-child + div button.rounded-lg',
		// );
		// if (availableBattles.length !== 0) {
		// 	console.log('BBBB fighting monsters');
		// 	for (let i = 0; i < availableBattles.length; i++) {
		// 		const battle = availableBattles[i];
		// 		battle.click();
		// 		await sleep(700);
		// 		$("button[type=submit]:contains('Hunt')").click();
		// 		await sleep(700);
		// 	}
		// 	return true;
		// }
		const battleMaxButton = $("button:contains('Battle Max')");
		if (battleMaxButton.length !== 0) {
			console.log('BBBB fighting monsters');
			battleMaxButton.click();
			return true;
		}

		// Start hunting for new monsters
		console.log('BBBB Starting Hunt');
		$("button:contains('Start Hunt')").click();
		return true;
	};

	const startDungeonDiving = async () => {
		const joined = await checkBossBattle();
		if (joined === true) return true;
		await waitTillDoneDoingSomething(10000);
		// Select random dungeon option
		let dungeonOptions = $(
			'#game-container > div:first-child > div:first-child + div > div:first-child > div:first-child > div:first-child + div + div + div + div + div button',
		);
		dungeonOptions = dungeonOptions.map((item) => dungeonOptions[item]);
		const randomDungeon = Math.floor(Math.random() * dungeonOptions.length);
		console.log('BBBB randomDungeon, dungeonOptions: ', randomDungeon, dungeonOptions);
		dungeonOptions[randomDungeon].click();
		await sleep(500);
		// Start dungeon dive
		$("button:contains('Start Dungeon')").click();
		return true;
	};

	const __navigate = async (location) => {
		// If needed Open navigation
		// Click Navigation
		console.log('BBBB Navigating to', location);
		$(`a:contains('${location}')`).click();
		window.location.href = location;
	};

	const navigateNext = async (location) => {
		if (location) {
			return __navigate(location);
		}
		// Check ls if there is a next location
		const nextLocation = ls.get(ls.nextLocation);
		if (nextLocation) {
			ls.delete(ls.nextLocation);
			return __navigate(nextLocation);
		}
		// randomly navigate to mining or woodcutting
		await __navigate(Math.random() > 0.5 ? locations.mining : locations.woodcutting);
	};

	const setNavigateNext = (location) => {
		ls.set(ls.nextLocation, location);
		return ls.get(ls.nextLocation);
	};

	const checkAutomation = async () => {
		let path = window.location.pathname;
		let success = false;
		switch (path) {
			case locations.alchemy:
				console.log('BBBB alchemy');
				await waitTillDoneDoingSomething();
				success = await craftFirstAvailableItem(true);
				if (!success) {
					await navigateNext(locations.battle);
				}
				break;

			case locations.smelting:
				console.log('BBBB Auto Smelt');
				await waitTillDoneDoingSomething();
				success = await craftFirstAvailableItem(true);
				if (!success) {
					await navigateNext(locations.forge);
				}
				break;
			case locations.forge:
				console.log('BBBB forging');
				await waitTillDoneDoingSomething();
				success = await craftFirstAvailableItem(true);
				if (!success) {
					await navigateNext();
				}
				break;

			case locations.mining:
				console.log('BBBB mining');
				// wait 1 minute at a time
				await waitTillDoneDoingSomething(60000);
				success = await startFirstAvailableItem(ls.get(ls.coalMining) !== 'true');
				break;
			case locations.woodcutting:
				console.log('BBBB woodcutting');
				// wait 1 minute at a time
				await waitTillDoneDoingSomething(60000);
				success = await startFirstAvailableItem(true);
				break;

			case locations.battle:
				console.log('BBBB battle');
				if (ls.get(ls.dungeonDive) === 'true') {
					success = await startDungeonDiving();
				} else {
					success = await startBattle();
				}
				break;

			case locations.fishing:
				console.log('BBBB fishing');
				await waitTillDoneDoingSomething();
				success = await craftFirstAvailableItem(true);
				if (!success) {
					await navigateNext(locations.cooking);
				}
				break;
			case locations.cooking:
				console.log('BBBB cooking');
				await waitTillDoneDoingSomething();
				success = await craftFirstAvailableItem(true);
				if (!success) {
					await navigateNext();
				}
				break;

			case locations.inventory:
				console.log('BBBB inventory');
				return;
			default:
				console.warn('Unprogrammed Page: ', path);
				return;
		}
		console.log('BBBB Action started: ', success);
		if (autoGame.__isAutomated === true) {
			// refresh the page every 5 minutes
			if (new Date() - autoGame.startTime > 300000) {
				window.location.reload();
			}
			startAutomation();
		}
	};

	const stopAutomation = () => {
		ls.set(ls.autoStart, false);
		autoGame.__isAutomated = false;
		clearTimeout(autoGame.__autoplayTimeoutValue);
	};

	const startAutomation = () => {
		ls.set(ls.autoStart, true);
		autoGame.__isAutomated = true;
		autoGame.__autoplayTimeoutValue = setTimeout(checkAutomation, 1000);
	};

	const setDungeonDive = (value) => {
		ls.set(ls.dungeonDive, value);
	};

	const setCoalMining = (value) => {
		ls.set(ls.coalMining, value);
	};

	const getStateOfAutomation = () => {
		return {
			__isAutomated: autoGame.__isAutomated,
			__autoplayTimeoutValue: autoGame.__autoplayTimeoutValue,
			__startTime: autoGame.startTime,
			__nextLocation: ls.get(ls.nextLocation),
			__dungeonDive: ls.get(ls.dungeonDive),
			__coalMining: ls.get(ls.coalMining),
		};
	};

	autoGame.stop = stopAutomation;
	autoGame.start = startAutomation;
	autoGame.__isAutomated = JSON.parse(ls.get(ls.autoStart) || 'false');

	autoGame.getStatus = getStateOfAutomation;
	autoGame.setNavigateNext = {};
	Object.keys(locations).map((location) => {
		autoGame.setNavigateNext[location] = () => setNavigateNext(locations[location]);
	});
	autoGame.locations = locations;
	autoGame.setDungeonDive = setDungeonDive;
	autoGame.setCoalMining = setCoalMining;
	autoGame.test = checkAutomation;
	autoGame.startTime = new Date();
	if (autoGame.__isAutomated) {
		setTimeout(autoGame.test, 2000);
	}
	autoGame.load = () => {
		window.autoGame = autoGame;
	};
	document.autoGame = autoGame;
})();
