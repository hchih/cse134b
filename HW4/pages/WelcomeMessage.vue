<!-- vim: set tw=99: -->

<template>
  <article>
    <header>
      <h2>CRUD Demo</h2>
    </header>
    <p v-if="!user">
      Please sign in or sign up with the buttons above.
    </p>
    <p v-if="user">
      Start by
      <router-link to="/add-game"><strong>creating</strong></router-link>
      a board game entry in our database. You'll then be able to
      <strong>read</strong> its game page, <strong>update</strong> the
      information you entered, or <strong>delete</strong> it. From the game
      add/edit page, you'll be able to perform CRUD operations on the game image
      asset.
    </p>
  </article>
</template>

<script>
  export default {
    props: ['firebaseAuth'],
    data: function () {
      return {
        user: this.firebaseAuth.currentUser,
        unsubscribe: null
      };
    },
    mounted: function () {
      this.unsubscribe = this.firebaseAuth.onAuthStateChanged((function (user) {
        this.user = user;
      }).bind(this));
    },
    beforeDestroy: function () {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    }
  };
</script>
