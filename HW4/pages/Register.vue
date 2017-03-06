<!-- vim: set tw=99: -->

<template>
  <form id="credentials"
        v-on:submit.prevent="register">
    <fieldset class="outer">
      <legend>Register</legend>
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
      <label>
        <smalL>Confirm Password</smalL>
        <input type="password"
               required="required"
               ref="confirmPassword"
               :disabled="loading"
               v-model="confirmPassword"/>
      </label>
      <button class="mini primary"
              :disabled="loading">
        Register
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
        confirmPassword: '',
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
      register: function () {
        this.loading = true;
        this.error = null;
        this.firebaseAuth.createUserWithEmailAndPassword(this.email, this.password)
          .catch((function (error) {
            this.loading = false;
            console.log(error);
            switch (error.code) {
              case 'auth/email-already-in-use':
                this.error = 'Email in use.';
                break;
              case 'auth/invalid-email':
                this.error = 'Invalid email.';
                break;
              case 'auth/weak-password':
                this.error = 'Password is too weak.';
                break;
              default:
                this.error = 'Registration failed.';
                break;
            }
          }).bind(this))
      },
      ensurePasswordsMatch: function () {
        if (this.password === this.confirmPassword) {
          this.$refs.confirmPassword.setCustomValidity('');
        } else {
          this.$refs.confirmPassword.setCustomValidity('Passwords must match');
        }
      },
      googleError: function (error) {
        console.log(error);
        switch (error.code) {
          case 'auth/account-exists-with-different-credential':
            this.$router.push('/login?next=' + escape(this.next));
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
    },
    watch: {
      password: function (newValue) {
        this.ensurePasswordsMatch();
      },
      confirmPassword: function (newValue) {
        this.ensurePasswordsMatch();
      }
    }
  };
</script>
