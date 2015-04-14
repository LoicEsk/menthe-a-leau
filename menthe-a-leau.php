<?php
/*
Plugin Name: menthe-a-leau
Plugin URI: https://github.com/LoicEsk/menthe-a-leau
Description: A plugin to analayse plants datas
Version: 1.0
Author: Loïc Laurent
Author URI: http://loiclaurent.com
License: GPLv2 or later
Text Domain: menthe-a-leau
*/

defined( 'ABSPATH' ) or die( 'No script kiddies please!' );


// Installation
// création des bases de données
global $menth_db_version;
$menth_db_version = get_option( "menth_db_version" );

function menth_install() {
	global $wpdb;
	global $menth_db_version;

	$table_name = $wpdb->prefix . 'data_menthe';
	
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

