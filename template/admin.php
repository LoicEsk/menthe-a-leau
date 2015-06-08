<?php
	// lecture des données
	global $menth_db_version;
	global $wpdb;
	global $menthe_table;

	$compte = $wpdb->get_var( "SELECT COUNT(*) FROM $menthe_table" );
?>
<div class="wrap">
	<h2>Menthe à l'eau</h2>

	<div class="metabox-holder">
		<div class="postbox">
			<h3 class="hndle">Infos plugin</h3>
			<div class="inside">
				<ul>
					<li>Version bdd : <strong><?php echo($menth_db_version); ?></strong></li>
					<li>Nom de la table : <strong><?php echo($menthe_table); ?></strong></li>
					<li>Nombre d'entrées : <strong><?php echo($compte); ?></strong></li>
				</ul>
			</div>
		</div>
		
		<div class="postbox">
			<h3 class="hndle">Utilisation</h3>
			<div class="inside">
				<p>Utiliser le shortcode <em>[datalizer]</em> là où vous voulez insérer la visualisation</p>
			</div>
		</div>

		<div class="postbox">
				<h3 class="hndle">Visualisation</h3>
				<div class="inside">
					<?php 
						include(plugin_dir_path( __FILE__ ).'output-datalizer.php'); ?>
				</div>
			</div>

		</div>

</div><!-- .wrap -->