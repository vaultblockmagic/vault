pragma circom 2.0.3;

include "../circomlib/circuits/poseidon.circom";

template vaultCorePassword() {
    /* Example input.json
    {
      "password_0": "112097115115119111114100",
      "password_1": "0",
      "provided_password_hash": "19373765451543693718085184639832271406407042427950644166461705559036908027421",
      "timestamp": "3333333333333"
  	}*/

    //password = password_0 ++ password_1 to facilitate up to 50 ASCII characters
    signal input password_0;
    signal input password_1;
    signal input provided_password_hash;
  	signal input timestamp;
  
    //verify password 
    component hash_password = Poseidon(2);

    hash_password.inputs[0] <== password_0;
    hash_password.inputs[1] <== password_1;

  	timestamp === timestamp;
    hash_password.out === provided_password_hash;
}

component main { public [ provided_password_hash, timestamp ] } = vaultCorePassword();