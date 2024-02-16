<script lang="ts">
	import { GameState } from './logic';
	import Keypad from './Keypad.svelte';

	let value = '';
	let game_state = GameState.START;
	let show_pin = false;

	function bkspc_handler() {
		if (value) {
			value = value.slice(0, value.length - 1);
		}
	}

	function enter_handler() {
		if (value.length == 4) {
			game_state = GameState.FINISH;
		}
	}

	function press_handler(i: number) {
		if (value.length == 4) return;
		value += String(i);
	}
</script>

<svelte:head>
	<title>Regular PIN Entry</title>
	<meta name="description" content="Regular PIN Entry" />
</svelte:head>

<h1>Regular PIN Entry</h1>

{#if game_state === GameState.START}
	<button on:click={() => (game_state = GameState.PROGRESS)}>Start Game</button>
{:else if game_state === GameState.PROGRESS}
	<input type="number" placeholder="Enter shifted PIN" bind:value readonly />
	<br />
	<Keypad {bkspc_handler} {enter_handler} {press_handler} />
{:else}
	{#if show_pin}
		<div>Entered PIN: {value}</div>
	{/if}
	<br />
	<button on:click={() => (show_pin = !show_pin)}>Toggle PIN Visibility</button>
{/if}

<style>
	h1 {
		width: 100%;
	}
	input {
		font-size: 1em;
	}
</style>
