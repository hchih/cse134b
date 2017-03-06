<!-- vim: set tw=99: -->

<template>
  <form id="credentials"
        v-on:submit.prevent="login">
    <fieldset class="outer">
      <legend>Log In</legend>
      <error-message v-if="error">{{ error }}</error-message>
      <label>
        <small>Email Address</small>
        <input type="email"
               required="required"
               :disabled="loading"
               v-model="email"/>
      </label>
      <label>
        <small>Password</small>
        <input type="password"
               required="required"
               :disabled="loading"
               v-model="password"/>
      </label>
      <button class="mini primary"
              :disabled="loading">
        Log In
      </button>
      <google-auth :firebaseAuth="firebaseAuth"
                   v-on:error="googleError"/>
    </fieldset>
  </form>
</template>

<script>
  export default {
    props: ['firebaseAuth', 'next'],
    data: function () {
      return {
        unsubscribe: null,
        email: '',
        password: '',
        loading: false,
        error: null
      };
    },
    mounted: function () {
      this.unsubscribe = this.firebaseAuth.onAuthStateChanged((function (user) {
        if (user) {
          this.$router.push(this.next);
        }
      }).bind(this));
    },
    beforeDestroy: function () {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    },
    methods: {
      login: function () {
        this.loading = true;
        this.error = null;
        this.firebaseAuth.signInWithEmailAndPassword(this.email, this.password)
          .catch((function (error) {
            this.loading = false;
            console.log(error);
            switch (error.code) {
              case 'auth/invalid-email':
                this.error = 'Invalid email.';
                break;
              case 'auth/user-disabled':
                this.error = 'Account disabled.';
                breakGkk
              case 'auth/user-not-found':
                this.error = 'Unrecognized email.';
                break;
              case 'auth/wrong-password':
                this.error = 'Wrong password.';
                break;
              default:
                this.error = 'Login failed.';
                break;
            }
          }).bind(this));
      },
      googleError: function (error) {
        console.log(error);
        switch (error.code) {
          case 'auth/account-exists-with-different-credential':
            this.error = 'Sign in with your password instead.';
            break;
          case 'auth/popup-blocked':
            this.error = 'Popup blocked by browser.';
            break;
          case 'auth/cancelled-popup-request':
          case 'auth/popup-closed-by-user':
            this.error = null;
            break;
          default:
            this.error = 'Login failed.';
            break;
        }
      }
    }
  };
</script>
