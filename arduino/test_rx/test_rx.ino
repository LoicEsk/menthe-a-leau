// receiver.pde
//
// Simple example of how to use VirtualWire to receive messages
// Implements a simplex (one-way) receiver with an Rx-B1 module
//
// See VirtualWire.h for detailed API docs
// Author: Mike McCauley (mikem@airspayce.com)
// Copyright (C) 2008 Mike McCauley
// $Id: receiver.pde,v 1.3 2009/03/30 00:07:24 mikem Exp $

#include <VirtualWire.h>

void setup()
{
    Serial.begin(9600);	// Debugging only
    Serial.println("setup");

    // Initialise the IO and ISR
    //vw_set_ptt_inverted(true); // Required for DR3100
    vw_setup(2000);	 // Bits per sec
    vw_set_rx_pin(11);

    vw_rx_start();       // Start the receiver PLL running
}

void loop()
{
    uint8_t buf[VW_MAX_MESSAGE_LEN];
    uint8_t buflen = VW_MAX_MESSAGE_LEN;

    if (vw_wait_rx_max(200)) // Si un message est reçu dans les 200ms qui viennent
    {
        if (vw_get_message(buf, &buflen)) // On copie le message, qu'il soit corrompu ou non
        {
            Serial.print("RX : ");
            for (byte i = 0; i < buflen; i++) // Si il n'est pas corrompu on l'affiche via Serial
                Serial.print(buf[i]);
            Serial.println("");
            
            // conversion en string
            String MsgRx = String(buf);
            Serial.print("Rx String : ");
            Serial.println(msgRx);
        }
    }
}
