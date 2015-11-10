//#include <Adafruit_GFX.h>
//#include <Adafruit_PCD8544.h>

#include <OneWire.h>
#include <EEPROM.h>

#include "DHT.h"
#define DHTTYPE DHT11
#define DHTPIN 2 // DHT11 sur pin2

/*
  Le % d'humidité de la terre est enregistré dans l'EEPROM
  humidité min : EEPROM @0
  humidité max : EEPROM @1
 
*/
/* PINS
=================== */
// humidité terre
const int PIN_POWER_HUMID = 7;
const int PIN_HUMID1 = A5;
// LED temoin
const int PINLED = 8;
// la pompe
const int PIN_POMPE = 3; // PWM
// photoresistance
const int PIN_PHOTOR = A0;
// bouton marche foréce pompe
const int PIN_BTN_POMPE = 4;

// température
OneWire  ds(10);

// Initialize DHT sensor for normal 16mhz Arduino
DHT dht(DHTPIN, DHTTYPE);

// variables globales
int humiditeMax = 75; // % d'humidité de la terre à maintenir
int humiditeMin = 65; // % d'écart par rapport au niveau
byte erreur = 0;
unsigned long intervalCapture = 1200000; // 20 min
unsigned long lastCapture = 0;
int luminositeMax = 80;
unsigned long lastFlashLed = 0;
float humidiTerre = 50;
float humiditeAir = 99;

// données capteurs
float temperature = 0;
float humiditeTerre = 0;
int luminosite = 0;

void setup(){
  Serial.begin(9600);
  Serial.println(F("METEOLAB v0.4"));
  
  /*lcd.begin();
  lcd.setContrast(54);
  lcd.display();
  pinMode(PIN_LEDLCD, OUTPUT);
  analogWrite(PIN_LEDLCD, 0);*/
  
  dht.begin();
  
  // pin humidité
  pinMode(PIN_POWER_HUMID, OUTPUT);
  digitalWrite(PIN_POWER_HUMID, LOW);
  pinMode(PIN_HUMID1, INPUT);

  //pins pompe
  pinMode(PIN_POMPE, OUTPUT);
  digitalWrite(PIN_POMPE, LOW);
  // bouton pompe
  pinMode(PIN_BTN_POMPE, INPUT);
  
  // pin LED
  pinMode(PINLED, OUTPUT);
  
  // lectues de parametres EEPROMM
  byte dataMem = EEPROM.read(0);
  if((dataMem > 0) && (dataMem < 100)){
    humiditeMin = dataMem;
  }
  dataMem = EEPROM.read(1);
  if((dataMem > 0) && (dataMem < 100)){
    humiditeMax = dataMem;
  }
  
  
  // attente de 1s pour laisser le temps aux capteurs de s'initialiser
  for(byte i = 0; i < 10; i++){
    digitalWrite(PINLED, HIGH);
    delay(100);
    digitalWrite(PINLED, LOW);
    delay(100);
  }
  
  // initialisation capteurs
  getHumiditeTerre(false);
  humidiTerre = humiditeTerre;  
  
  
  // infos
  printConfig();

}

void loop(){
  // lecture série (commandes manuelles
  if(Serial.available() > 0) uiSerie();
  
  // anti dépassement de valeur
  if(millis() < lastCapture) lastCapture = 0;
  
  // temporisation
  if((millis() - lastCapture > intervalCapture) || (lastCapture == 0)){
    updateDatas(); // lecture capteurs
    // arrosage si besoin
    if((humiditeTerre < humiditeMin) || (erreur > 0)){
        arrosage(); 
    }
    lastCapture = millis();
  }
  
  // bouton de marche forcée de la pompe
  int btnState = digitalRead(PIN_BTN_POMPE);
  if(btnState == HIGH){
    // mise en route de la pompe
    Serial.println(F(";arrosage_manuel=0;"));
    delay(1000);
    Serial.println(F(";arrosage_manuel=100;"));
    digitalWrite(PIN_POMPE, HIGH);
    digitalWrite(PINLED, HIGH); // LED
    while(digitalRead(PIN_BTN_POMPE)){
      delay(100);
    }
    digitalWrite(PIN_POMPE, LOW);
    digitalWrite(PINLED, LOW); // LED
    Serial.println(F(";arrosage_manuel=100;"));
    delay(1000);
    Serial.println(F(";arrosage_manuel=0;"));
    // mise à jour des données
    //updateDatas();
  }
  
  if((erreur == 0) && (millis() - lastFlashLed > 4500)){
    digitalWrite(PINLED, HIGH);
    delay(500);
    digitalWrite(PINLED, LOW);
    lastFlashLed = millis();
    
    // infos sur la loop
    /*unsigned long interWait = millis() - lastCapture;
    Serial.print(F("Waiting : "));
    Serial.print(interWait);
    Serial.print(F("/"));
    Serial.println(intervalCapture);*/
  }
  if((erreur > 0) && (millis() - lastFlashLed > 500)){
    digitalWrite(PINLED, HIGH);
    delay(200);
    digitalWrite(PINLED, LOW);
    lastFlashLed = millis();
  }
  
}

void uiSerie(){
  unsigned long startWait = millis();
  
  int commande = 0;
  if(Serial.available() > 0) commande = Serial.parseInt();
  
  switch(commande){
    case 1: // lecture des données capteurs
      printConfig(); // infos paramétrage
      updateDatas(); // lecture capteurs et affichage
      break;
    case 2: // changement du niveau d'humidité
      Serial.println(F("Entrer le niveau d'humidite min en %"));
      
      while(millis() - startWait < 30000){
        if(Serial.available() > 0){
          int entree = Serial.parseInt();
          Serial.println(entree);
          if((entree > 0) && (entree < 100)){
            humiditeMin = entree;
            // entregisrement EEPROM
            EEPROM.write(0, entree);
            Serial.println(F("Enregistre !"));
            break;
          }else{
            Serial.println(F("Erreur ! Le niveau doit être compris entre 0 et 100"));
            startWait = millis();
          }
        }
      }
      break;
    case 3: // changement du niveau d'humidité
      Serial.println(F("Entrer le niveau d'humidite max en %"));
      
      while(millis() - startWait < 30000){
        if(Serial.available() > 0){
          int entree = Serial.parseInt();
          Serial.println(entree);
          if((entree > 0) && (entree < 100)){
            humiditeMax = entree;
            // entregisrement EEPROM
            EEPROM.write(1, entree);
            Serial.println(F("Enregistre !"));
            break;
          }else{
            Serial.println(F("Valeur incorrecte !"));
            startWait = millis();
          }
        }
      }
      break;
      
    default :
      Serial.println(F("-- Menu --"));
      Serial.println(F("  1 > Lecture des donnes capteurs"));
      Serial.println(F("  2 > Choix du niveau d'humidite min"));
      Serial.println(F("  3 > Choix du niveau d'humidite max"));
  }
}

void updateDatas(){
  // lecture des capteurs
  // mise à jour des variables globales
  
  // la température
  getTemperature();
    
  // humidité de la terre
  getHumiditeTerre(true);
  
  // humidité air
  humiditeAir = getHumiditeDHT();;
  
}

void getHumiditeTerre(boolean filtre){
  digitalWrite(PIN_POWER_HUMID, HIGH);
  delay(10);
  float humidBrut = analogRead(PIN_HUMID1);
  delay(10);
  digitalWrite(PIN_POWER_HUMID, LOW);
  float humidi = humidBrut / 1023 * 100; // donnée en %

  // filtrage
  humidiTerre = (20 * humidiTerre + humidi) / 21;
  
  if(filtre){
    humiditeTerre = humidiTerre;
  }else
    humiditeTerre = humidi;
  
  Serial.print(F(";HumiT="));
  Serial.print(humiditeTerre);
  //Serial.println(F("%"));
  Serial.print(F(";HumiTbrut="));
  Serial.print(humidi);
  Serial.println(';');

}

float getHumiditeDHT(){
  // Read temperature as Celsius
  float h = dht.readHumidity();
  
  Serial.print(F(";HumiditeAir="));
  Serial.print(h);
  Serial.println(F(";"));
  
  // Check if any reads failed and exit early (to try again).
  if (isnan(h)) {
    Serial.println("Failed to read from DHT sensor!");
    return 99;
  }
  
  return h;
}

void arrosage(){
  unsigned long debArrosage = millis();
  unsigned long duree = 0;
  boolean assezDeau = false;
  
  Serial.println(F("Arrosage !"));
  Serial.print(F(";arrosage=0;"));
  //delay(1000); // pour les courbes de données
  //Serial.print(F(";arrosage=100;"));
  
  // démarrage pompe
  digitalWrite(PIN_POMPE, HIGH);
  digitalWrite(PINLED, HIGH); // LED
  
  float valArrosage = 0;
  
  Serial.println(F("Demarrage pompe"));
  for(byte i = 220; i < 256; i++){
    analogWrite(PIN_POMPE, i);
    //Serial.println(i);
    valArrosage = i / 2.55;
    Serial.print(F(";arrosage="));
    Serial.print(valArrosage);
    Serial.println(';');
    delay(120);
  }
  //analogWrite(PIN_POMPE, 255);
  while((duree < 30000) && !assezDeau){
    delay(2000);
    //Serial.print(F(";arrosage=100;"));
    getHumiditeTerre(true);
    
    duree = millis() - debArrosage;
    assezDeau = (humiditeTerre > humiditeMax);
  }
  
  // stop pompe
  Serial.println("Arret pompe");
  analogWrite(PIN_POMPE, 0);
  digitalWrite(PINLED, LOW); // LED
  Serial.println(F(";arrosage=100;"));
  delay(1000); // pour les courbes de données
  Serial.println(F(";arrosage=0;"));
  
  
  if(!assezDeau) erreur = 1;
  else erreur = 0;
}

float getTemperature(){
  float tempDS = getTemperatureDS();
  // temperature capteur 2
  float tempDHT = getTemperatureDHT();
  if(tempDHT == 999){
    // erreur
    tempDHT = tempDS;
  }
  
  // données brutes
  //Serial.print(F(";temperatureDS="));
  //Serial.print(tempDS);
  /*Serial.print(F(";temperatureDHT="));
  Serial.print(tempDHT);
  Serial.println(F(";"));*/
  
  temperature = tempDS;
  Serial.print(F(";Temperature="));
  Serial.print(temperature);
  Serial.println(F(";"));
}

float getTemperatureDHT(){
  // Read temperature as Celsius
  float t = dht.readTemperature();
  
  // Check if any reads failed and exit early (to try again).
  if (isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return 99;
  }
  
  return t;
}

void printConfig(){
  Serial.print(F("Niveau d'humidite maintenu entre "));
  Serial.print(humiditeMin);
  Serial.print(F("%"));
  Serial.print(F(" et "));
  Serial.print(humiditeMax);
  Serial.println(F(" %"));
}


float getTemperatureDS() {
  byte i;
  byte present = 0;
  byte type_s;
  byte data[12];
  byte addr[8];
  float celsius, fahrenheit;
  
  i = 0;
  while(i<3){
    if (!ds.search(addr)) {
      //Serial.println("No more addresses.");
      ds.reset_search();
      delay(250);
      if(i<3)
        i++;
      else
         return 999;
    }else
      i=3;
  }
  
  /*Serial.print("ROM =");
  for( i = 0; i < 8; i++) {
    Serial.write(' ');
    Serial.print(addr[i], HEX);
  }*/

  if (OneWire::crc8(addr, 7) != addr[7]) {
      Serial.println(F("CRC is not valid!"));
      return 999;
  }

  ds.reset();
  ds.select(addr);
  ds.write(0x44,1);         // start conversion, with parasite power on at the end
  
  delay(1000);     // maybe 750ms is enough, maybe not
  // we might do a ds.depower() here, but the reset will take care of it.
  
  present = ds.reset();
  ds.select(addr);    
  ds.write(0xBE);         // Read Scratchpad

  /*Serial.print("  Data = ");
  Serial.print(present,HEX);
  Serial.print(" ");*/
  for ( i = 0; i < 9; i++) {           // we need 9 bytes
    data[i] = ds.read();
  }
  /*Serial.print(" CRC=");
  Serial.print(OneWire::crc8(data, 8), HEX);
  Serial.println();*/

  // convert the data to actual temperature

  unsigned int raw = (data[1] << 8) | data[0];
  if (type_s) {
    raw = raw << 3; // 9 bit resolution default
    if (data[7] == 0x10) {
      // count remain gives full 12 bit resolution
      raw = (raw & 0xFFF0) + 12 - data[6];
    }
  } else {
    byte cfg = (data[4] & 0x60);
    if (cfg == 0x00) raw = raw << 3;  // 9 bit resolution, 93.75 ms
    else if (cfg == 0x20) raw = raw << 2; // 10 bit res, 187.5 ms
    else if (cfg == 0x40) raw = raw << 1; // 11 bit res, 375 ms
    // default is 12 bit resolution, 750 ms conversion time
  }
  celsius = (float)raw / 16.0;
  
  return celsius;
}
/* fonction EEPROM
long EEPROMReadlong(long address)
{
  //Read the 4 bytes from the eeprom memory.
  long four = EEPROM.read(address);
  long three = EEPROM.read(address + 1);
  long two = EEPROM.read(address + 2);
  long one = EEPROM.read(address + 3);
  
  //Return the recomposed long by using bitshift.
  return ((four << 0) & 0xFF) + ((three << 8) & 0xFFFF) + ((two << 16) & 0xFFFFFF) + ((one << 24) & 0xFFFFFFFF);
}
void EEPROMWritelong(int address, long value)
{
  //Decomposition from a long to 4 bytes by using bitshift.
  //One = Most significant -> Four = Least significant byte
  byte four = (value & 0xFF);
  byte three = ((value >> 8) & 0xFF);
  byte two = ((value >> 16) & 0xFF);
  byte one = ((value >> 24) & 0xFF);
  
  //Write the 4 bytes into the eeprom memory.
  EEPROM.write(address, four);
  EEPROM.write(address + 1, three);
  EEPROM.write(address + 2, two);
  EEPROM.write(address + 3, one);
}
*/

