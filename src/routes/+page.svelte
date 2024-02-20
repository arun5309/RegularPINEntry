<script lang="ts">
	import { GameState } from './logic';
	import type { GetPointsResponse, CreateInstanceResponse, UpdateInstanceResponse } from './logic';
	import Keypad from './Keypad.svelte';

	let value = '';
	let game_state = GameState.START;
	let show_pin = false;
	let uid: string = '';
	let uid_valid: boolean = false;
	$: uid_valid = check_uid_valid(uid);
	let iid: number = -1;
	let actual_pin: string = '';

	function isAlphaNumeric(str: string): boolean {
		let code, i, len;
		for (i = 0, len = str.length; i < len; i++) {
			code = str.charCodeAt(i);
			if (!(code > 47 && code < 58) && !(code > 64 && code < 91) && !(code > 96 && code < 123)) {
				return false;
			}
		}
		return true;
	}

	function check_uid_valid(uid_cand: string): boolean {
		return uid_cand.length == 6 && isAlphaNumeric(uid_cand);
	}

	function bkspc_handler() {
		if (value) {
			value = value.slice(0, value.length - 1);
		}
	}

	function finish_transition() {
		const url = 'https://142.93.219.243.nip.io/update_instance';
		const data = {
			iid_value: iid,
			result_pin: value
		};
		const request = new Request(url, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: new Headers({
				'Content-Type': 'application/json; charset=UTF-8'
			})
		});
		fetch(request).then((instance_response_value_temp) => {
			instance_response_value_temp.json().then((temp) => {
				const instance_response_value = <UpdateInstanceResponse>(<unknown>temp);
				if (iid !== instance_response_value.iid) {
					alert('Reached invalid state, please report bug!');
				}
				game_state = GameState.FINISH;
			});
		});
	}

	function enter_handler() {
		if (value.length == 4) {
			finish_transition();
		}
	}

	function press_handler(i: number) {
		if (value.length == 4) return;
		value += String(i);
	}

	function progress_transition() {
		if (!uid_valid) return;
		const url = 'https://142.93.219.243.nip.io/create_instance';
		const data = {
			game_id: 'RPE',
			user_id: uid.toLowerCase()
		};
		const request = new Request(url, {
			method: 'POST',
			body: JSON.stringify(data),
			headers: new Headers({
				'Content-Type': 'application/json; charset=UTF-8'
			})
		});
		fetch(request).then((create_instance_value_temp) => {
			create_instance_value_temp.json().then((temp) => {
				const create_instance_value = <CreateInstanceResponse>(<unknown>temp);
				iid = create_instance_value.iid;
				game_state = GameState.PROGRESS;
			});
		});
	}

	async function get_points(): Promise<GetPointsResponse> {
		const url = `https://142.93.219.243.nip.io/points/${uid.toLowerCase()}`;
		const request = new Request(url, { method: 'GET' });
		const data = await fetch(request);
		return <GetPointsResponse>(<unknown>data.json());
	}

	function normalize() {
		uid = uid;
	}

	function set_actual_pin(val: string) {
		actual_pin = val;
	}

	function reset() {
		value = '';
		game_state = GameState.START;
		show_pin = false;
		uid_valid = false;
		iid = -1;
		actual_pin = '';
		const temp = uid;
		uid = '';
		uid = temp;
	}
</script>

<svelte:head>
	<title>Regular PIN Entry</title>
	<meta name="description" content="Regular PIN Entry" />
</svelte:head>

<h1>Regular PIN Entry</h1>

{#if game_state === GameState.START}
	<input type="text" placeholder="User ID" bind:value={uid} on:change={normalize} maxlength="6" />
	{#if uid_valid}
		{#await get_points()}
			<p>Validating User ID...</p>
		{:then get_points_value}
			{#if get_points_value.uid !== null}
				{(set_actual_pin(get_points_value.actual_pin), '')}
				<p style="color: green">Points: {get_points_value.points}</p>
			{:else}
				<p style="color: red">Invalid User ID!</p>
			{/if}
		{:catch error}
			{(console.log(error), '')}
			<p style="color: purple">Network Error: Unable to check validity of User ID!</p>
		{/await}
	{/if}
	<br />
	<button on:click={progress_transition}>Start Game</button>
{:else if game_state === GameState.PROGRESS}
	<input type="number" placeholder="Enter shifted PIN" bind:value readonly />
	<br />
	<Keypad {bkspc_handler} {enter_handler} {press_handler} />
{:else}
	{#if show_pin}
		<div>Entered PIN: {value}</div>
	{/if}
	<br />
	{#if actual_pin === value}
		<p style="color: green">Congratulations on entering the correct PIN!</p>
	{:else}
		{(console.log('Actual:', actual_pin, 'Entered:', value), '')}
		<p style="color: red">Incorrect PIN entered, no points earned!</p>
	{/if}
	<br />
	{#await get_points()}
		<p>Fetching points...</p>
	{:then get_points_value}
		{#if get_points_value.uid !== null}
			<p style="color: green">Points: {get_points_value.points}</p>
		{:else}
			<p style="color: red">Invalid User ID!</p>
		{/if}
	{:catch error}
		{(console.log(error), '')}
		<p style="color: purple">Network Error: Unable to fetch points!</p>
	{/await}
	<br />
	<button on:click={() => (show_pin = !show_pin)}>Toggle Visibility of Entered PIN</button>
	<br />
	<button on:click={reset}>Play Again</button>
{/if}

<style>
	h1 {
		width: 100%;
	}
	input {
		font-size: 1em;
	}
</style>
