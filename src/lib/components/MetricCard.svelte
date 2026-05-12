<script lang="ts">
	let {
		label,
		value,
		hint = '',
		tone = 'neutral'
	}: {
		label: string;
		value: string | number;
		hint?: string;
		tone?: 'danger' | 'warning' | 'success' | 'info' | 'neutral';
	} = $props();
</script>

<article class={`metric-card tone-${tone}`}>
	<div class="metric-card__label">{label}</div>
	<div class="metric-card__value">{value}</div>
	{#if hint}
		<p class="metric-card__hint">{hint}</p>
	{/if}
</article>
