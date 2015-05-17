<?php
/*
Plugin Name: menthe-a-leau
Plugin URI: https://github.com/LoicEsk/menthe-a-leau
Description: A plugin to analayse plants datas
Version: 0.1.7
Author: Loïc Laurent
Author URI: http://loiclaurent.com
License: GPLv2 or later
Text Domain: menthe-a-leau
GitHub Plugin URI: https://github.com/LoicEsk/menthe-a-leau
*/

defined( 'ABSPATH' ) or die( 'No script kiddies please!' );

// variables globales
global $menth_db_version;
$menth_db_version = get_option( "menth_db_version" );
global $menthe_table;
$menthe_table = $wpdb->prefix . 'data_menthe';

// hooks ajax
add_action( 'wp_ajax_menthe_getData', 'menthe_getData' ); // hook pour l'admin
function menthe_getData() {
	global $wpdb; // this is how you get access to the database
	global $menthe_table;

	$fromDate = $_POST['fromDate'];
	$toDate = $_POST['toDate'];

	$resultats = $wpdb->get_results( "SELECT * FROM $menthe_table WHERE time BETWEEN '$fromDate' AND '$toDate'" );
	echo(json_encode($resultats));

	wp_die(); // this is required to terminate immediately and return a proper response
}

add_action( 'wp_ajax_nopriv_menthe_setData', 'menthe_setData' ); // hook d'enregistrement
function menthe_setData() {
	global $menthe_table;
	global $wpdb;

	$date = date('Y-m-d H:i:s', time());
	$nom = $_POST['donnee'];
	$valeur = $_POST['valeur'];

	$wpdb->query( $wpdb->prepare( 
		"INSERT INTO $menthe_table VALUES ( '', %s, %s, %s )", 
		$date,
		$nom, 
		$valeur 
	));

	echo('La requete : ');
	printf("INSERT INTO $menthe_table VALUES ( '', %s, %s, %s )", $date, $nom, $valeur );

	wp_die();
}

// page admin
add_action( 'admin_menu', 'register_menthe_admin_page' );
function register_menthe_admin_page() {
	add_menu_page( 'Menthe à l\'eau', 'Menthe à l\'eau', 'edit_pages', 'menthe-a-leau/template/admin.php', '', 'dashicons-chart-area', 30 );
}

// JS pour la page admin
add_action( 'admin_enqueue_scripts', 'menthe_js_enqueue' );
function menthe_js_enqueue($hook) {
        
	wp_enqueue_script( 'ajax-script', plugins_url( '/js/datalizer.js', __FILE__ ), array('jquery') );

	// in JavaScript, object properties are accessed as ajax_object.ajax_url, ajax_object.we_value
	/*wp_localize_script( 'ajax-script', 'ajax_object',
            array( 'ajax_url' => admin_url( 'admin-ajax.php' ), 'we_value' => 1234 ) );*/
}

// shortcode intégration


// Installation
// création des bases de données
function menth_install() {
	global $wpdb;
	global $menth_db_version;

	global $menthe_table;
	$table_name = $menthe_table;
	
	$charset_collate = $wpdb->get_charset_collate();

	$sql = "CREATE TABLE $table_name (
		id mediumint(9) NOT NULL AUTO_INCREMENT,
		time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
		nom text NOT NULL,
		valeur float DEFAULT NULL,
		UNIQUE KEY id (id)
	) $charset_collate;";

	require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
	dbDelta( $sql );

	add_option( 'menth_db_version', '1.0' );
}
register_activation_hook( __FILE__, 'menth_install' );

