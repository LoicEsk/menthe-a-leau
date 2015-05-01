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
					<li>Nombre d'entrée : <strong><?php echo($compte); ?></strong></li>
				</ul>
			</div>
		</div>

		<div class="postbox">
				<h3 class="hndle">Graph</h3>
				<div class="inside">
					<div id="ajaxOut">
						<?php
							$resultats = $wpdb->get_results( "SELECT * FROM $menthe_table" );
							/*foreach($resultats as $entry){
								echo('<div>');
								print(json_encode($entry));
								echo('</div>');
							}*/
							echo(json_encode($resultats));
						?>
					</div>
				</div>
			</div>

		</div>

</div><!-- .wrap -->