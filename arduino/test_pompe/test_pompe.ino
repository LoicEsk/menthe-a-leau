// la pompe
const int PIN_POMPE = 3; // PWM

void setup(){
  pinMode(PIN_POMPE, OUTPUT);
  analogWrite(PIN_POMPE, 0);
  Serial.begin(9600);
  Serial.println("Test pompe");
}

void loop(){
  if(Serial.available() > 0){
    int entree = Serial.parseInt();
    if((entree >= 0) && (entree <= 255)){
      Serial.print("Sortie a ");
      Serial.println(entree);
      analogWrite(PIN_POMPE, entree);
    }else{
      Serial.println("Erreur !");
    }
  }
}
