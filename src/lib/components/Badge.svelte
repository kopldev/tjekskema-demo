<script lang="ts">
	let {
		label,
		tone = 'neutral'
	}: {
		label: string;
		tone?: 'danger' | 'warning' | 'success' | 'info' | 'neutral';
	} = $props();
</script>

<span class={`badge tone-${tone}`}>{label}</span>
