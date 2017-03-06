<!-- vim: set tw=99: -->

<template>
  <main>
    <header :class="{ loggedout: !user, loggedin: user }">
      <nav v-if="!user">
        <ul>
          <li>
            <router-link class="button primary"
                         :to="'/login?next=' + next">
              Log In
            </router-link>
          </li>
          <li>
            <router-link class="button"
                         :to="'/register?next=' + next">
              Register
            </router-link>
          </li>
        </ul>
      </nav>
      <nav v-if="user">
        <em>Welcome back, <strong>{{ user.email }}</strong>!</em>
        <ul>
          <li>
            <router-link to="/" exact="exact">
              Browse All Games
            </router-link>
          </li>
        </ul>
        <ul>
          <li>
            <router-link to="/played">
              My Played Games
            </router-link>
          </li>
          <li>
            <router-link to="/planned">
              My Planned Games
            </router-link>
          </li>
          <li>
            <router-link to="/collection">
              My Collection
            </router-link>
          </li>
          <li>
            <router-link to="/wishlist">
              My Wishlist
            </router-link>
          </li>
          <li>
            <router-link to="/invitations">
              My Invitations
            </router-link>
          </li>
        </ul>
        <ul>
          <li>
            <a href="#" v-on:click.prevent="logout">
              Log Out
            </a>
          </li>
        </ul>
      </nav>
      <h1>
        <router-link to="/">BoardGameDex</router-link>
      </h1>
    </header>
    <router-view/>
  </main>
</template>

<script>
  export default {
    props: ['firebaseAuth'],
    data: function () {
      return {
        user: this.firebaseAuth.currentUser,
        unsubscribe: null,
        next: '/'
      };
    },
    beforeRouteEnter: function (to, from, next) {
      next(function (vm) {
        vm.updateNext(to);
      });
    },
    beforeRouteUpdate: function (to, from, next) {
      this.updateNext(to);
      next();
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
    },
    methods: {
      logout: function () {
        this.firebaseAuth.signOut();
      },
      updateNext: function (to) {
        var next = to.query.next;
        this.next = next ? next : to.path;
      }
    }
  };
</script>
