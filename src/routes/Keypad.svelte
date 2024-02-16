<script lang="ts">
	export let bkspc_handler: () => void;
	export let enter_handler: () => void;
	export let press_handler: (i: number) => void;
</script>

<div class="keypad">
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each Array(10) as _, i}
		{#if i === 9}
			<button class="key" on:click={bkspc_handler}>Backspace</button>
			<button class="key digit" on:click={() => press_handler(0)}>0</button>
			<button class="key" on:click={enter_handler}>Enter</button>
		{:else}
			<button class="key digit" on:click={() => press_handler(i + 1)}>{i + 1}</button>
		{/if}
	{/each}
</div>

<style>
	.keypad {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-auto-rows: minmax(100px, auto);
		border-style: solid;
		background: white;
	}

	.key {
		background: white;
		display: flex;
		align-items: center;
		justify-content: center;
		border: solid;
	}
	.digit {
		font-size: 2em;
	}
</style>
