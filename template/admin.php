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
				<h3 class="hndle">Graph</h3>
				<div class="inside">
					<div id="datalizer">
						<div class="loaderLayout">Chargement ...</div>
						<canvas id="graph" width="100%"></canvas>
						<div id="ajaxOut"></div>
						<form id="settings">
							<select id="interval">
							    <option value="535680">Un an</option>
								<option value="267840">6 mois</option>
								<option value="133920" selected="true">3 mois</option>
								<option value="44640">1 mois</option>
								<option value="10080">1 semaine</option>
								<option value="1440">1 jour</option>
							</select>
							<input type="text" id="dateFin" value="NOW">
						</form>
					</div>
				</div>
			</div>

		</div>

</div><!-- .wrap -->