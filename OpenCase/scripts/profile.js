var config = {
    apiKey: "AIzaSyBnT4uYoOgs0Gl6F5_AtzY-q9hhM8z__E4",
    authDomain: "admob-app-id-8282025074.firebaseapp.com",
    databaseURL: "https://admob-app-id-8282025074.firebaseio.com",
    storageBucket: "admob-app-id-8282025074.appspot.com",
    messagingSenderId: "917984410977"
};
firebase.initializeApp(config);

$(document).on('click', '#registerButton', function() {
    if ($(this).hasClass('empty')) {
        $('#nickname').show();
        $(this).removeClass('empty');
        $('#loginButton').hide();
        $('#nickname').val(Player.nickname);
    } else {
        var nick = $("#nickname").val();
	   var validation = /^[a-zA-Zа-яёА-ЯЁ0-9_-]+$/;
	   if (nick != "" && validation.test(nick)) {
		  saveStatistic("playerNickname", nick)
	   } else {
        $("#login-status").text(Localization.settings2.notValidNickname[Settings.language]);
		return false;
	   }
        register();
    }
});

function register() {
    var email = $("#email").val() || "";
    var password = $("#password").val() || "";
    //if (email == "" || password == "") {
    //    return false;
    //}

    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;

        $("#login-status").text(error.message);
    })
    setTimeout(function() {
        if (firebase.auth().currentUser != null) {
            var ava = Player.avatar;
            if (/^\d+\.\w{3}$/.test(ava)) ava = "../images/ava/" + ava;
            firebase.auth().currentUser.updateProfile({
                displayName: Player.nickname,
                photoURL: ava
            }).then(function() {
                var userRef = firebase.database().ref('users/' + firebase.auth().currentUser.uid);

                var userSettingsRef = userRef.child('settings');
                userSettingsRef.child('language').set(Settings.language);
                userSettingsRef.child('sounds').set(Settings.sounds);
                userSettingsRef.child('drop').set(Settings.drop);

                var privateRef = userRef.child('private');
                privateRef.child('double').set(Player.doubleBalance);

                var publicRef = userRef.child('public');
                publicRef.child('points').set(Player.points);
                publicRef.child('nickname').set(Player.nickname);
                publicRef.child('avatar').set(ava);

                var rateRef = userRef.child('outside');
                rateRef.child('rep').set(0);
                
                var inventoryRef = firebase.database().ref('inventories/'+firebase.auth().currentUser.uid);
                inventoryRef.child('inventory_count').set(inventory.length);
            }, function(error) {
                $("#login-status").text(error.message);
            });
        }
    }, 2000);
}

function forgotPassword(email) {
    var auth = firebase.auth();
    auth.sendPasswordResetEmail(email)
    .then(function() {
          $("#login-status").text("Email send.");
    }, function(error) {
        $("#login-status").text(error.message);
    })
}

function showProfile(uid, callback) {
    var userInfoRef = firebase.database().ref('users/' + uid + '/public');
    userInfoRef.once('value').then(function(snapshot) {
        var userInfo = snapshot.val();
        callback(userInfo);
    })
}

function showRep(uid, callback) {
    var userInfoRef = firebase.database().ref('users/' + uid + '/outside/rep');
    userInfoRef.once('value').then(function(snapshot) {
        var userInfo = snapshot.val();
        callback(userInfo);
    })
}

function repVal(uid, callback) {
    var repRef = firebase.database().ref('users/' + uid + '/outside/rep');
    repRef.once('value').then(function(snapshot) {
        var rep = 0;
        var userRep = '0';
        var userUid = firebase.auth().currentUser.uid;
        snapshot.forEach(function (childSnapshot) {
            if (childSnapshot.val() == '+') {
                rep++;
                if (childSnapshot.key == userUid)
                    userRep = '+';
            } else if (childSnapshot.val() == '-') {
                rep--;
                if (childSnapshot.key == userUid)
                    userRep = '-';
            }
        })
        callback(rep, userRep);
    })
}

function setRep(uid, uidFrom, val) {
    var repRef = firebase.database().ref('users/' + uid + '/outside/rep');
    repRef.child(uidFrom).set(val);
}

function loadPosts(uid, callback) {
    var userPostsRef = firebase.database().ref('users/' + uid + '/posts');
    userPostsRef.once('value').then(function(snapshot) {
        var userPosts = snapshot.val();
        callback(userPosts);
    })
}

function login() {
    var email = $("#email").val() || "";
    var password = $("#password").val() || "";
    if (email == "" || password == "") {
        return false;
    }

    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;

        $("#login-status").text(error.message);
    });
}

function XSSreplace(text) {
    text = text.replace(/&/g, '&amp;');
    text = text.replace(/</g, '&lt;');
    text = text.replace(/>/g, '&gt;');
    text = text.replace(/"/g, '&quot;');
    text = text.replace(/'/g, '&#x27;');
    text = text.replace(/\//g, '&#x2F;');
    return text;
}
