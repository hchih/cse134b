<!-- vim: set tw=99: -->

<template>
  <p class="notice">
    You can also
    <a href="#" v-on:click.prevent="googleAuth">log in with your Google account</a>.
  </p>
</template>

<script>
  import firebase from 'firebase';

  export default {
    props: ['firebaseAuth'],
    data: function () {
      return {
        provider: new firebase.auth.GoogleAuthProvider()
      };
    },
    methods: {
      googleAuth: function () {
        this.firebaseAuth.signInWithPopup(this.provider)
          .catch((function (error) {
            this.$emit('error', error);
          }).bind(this));
      }
    }
  }
</script>
