<script lang="ts">
	let {
		title,
		description
	}: {
		title: string;
		description: string;
	} = $props();
</script>

<section class="empty-state">
	<h3>{title}</h3>
	<p>{description}</p>
</section>
