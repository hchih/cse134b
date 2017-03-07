<!-- vim: set tw=99: -->

<template>
  <article>
    <header>
      <h2>View Game</h2>
      <error-message v-if="error">{{ error }}</error-message>
      <game-widget :firebaseStorage="firebaseStorage"
                   :gameKey="gameKey"
                   :name="name"
                   :officialSite="officialSite"
                   :amazonLink="amazonLink"/>
    </header>
    <dl>
      <dt v-if="genre">Genre:</dt>
      <dd v-if="genre">{{ genre }}</dd>
      <dt v-if="playerCountStart && playerCountEnd">Player Count:</dt>
      <dd v-if="playerCountStart && playerCountEnd">
        {{ playerCountStart == playerCountEnd
             ? playerCountStart
             : playerCountStart + '-' + playerCountEnd }}
      </dd>
      <dt v-if="playTimeStart && playTimeEnd">Play Time:</dt>
      <dd v-if="playTimeStart && playTimeEnd">
        {{ playTimeStart == playTimeEnd
             ? playTimeStart
             : playTimeStart + '-' + playTimeEnd }}
        {{ playTimeEnd == 1 ? 'hour' : 'hours' }}
      </dd>
      <dt v-if="difficultyLevel">Difficulty Level:</dt>
      <dd v-if="difficultyLevel">{{ difficultyLevel }}</dd>
      <dt v-if="gameSummary">Game Summary:</dt>
      <dd v-if="gameSummary" class="summary">{{ gameSummary }}</dd>
      <dt v-if="rulesSummary">Rules Summary:</dt>
      <dd v-if="rulesSummary" class="summary">{{ rulesSummary }}</dd>
    </dl>
    <footer v-if="user">
      <a :class="{ button: true, mini: true, declue: true, disabled: loading }"
         v-on:click.prevent="edit">
        Edit Info
      </a>
      <a :class="{ button: true, mini: true, decline: true, disabled: loading }"
         v-on:click.prevent="del">
        Delete Game
      </a>
    </footer>
  </article>
</template>

<script>
  export default {
    props: ['firebaseAuth', 'firebaseDB', 'firebaseStorage', 'gameKey'],
    data: function () {
      return {
        user: null,
        name: '',
        officialSite: '',
        amazonLink: '',
        playerCountStart: '',
        playerCountEnd: '',
        playTimeStart: '',
        playTimeEnd: '',
        genre: '',
        difficultyLevel: '',
        gameSummary: '',
        rulesSummary: '',
        loading: true,
        error: null
      };
    },
    mounted: function () {
      this.loading = true;
      this.error = null;
      this.unsubscribe = this.firebaseAuth.onAuthStateChanged((function (user) {
        this.user = user;
      }).bind(this));
      this.firebaseDB.ref('games').child(this.gameKey).once('value')
        .then((function (snapshot) {
          var game = snapshot.val();
          this.name = game.name;
          this.officialSite = game.officialSite;
          this.amazonLink = game.amazonLink;
          this.playerCountStart = game.playerCountStart;
          this.playerCountEnd = game.playerCountEnd;
          this.playTimeStart = game.playTimeStart;
          this.playTimeEnd = game.playTimeEnd;
          this.genre = game.genre;
          this.difficultyLevel = game.difficultyLevel;
          this.gameSummary = game.gameSummary.trim();
          this.rulesSummary = game.rulesSummary.trim();
          this.loading = false;
        }).bind(this))
        .catch((function (error) {
          this.error = 'Loading game information failed.';
          window.scrollTo(0, 0);
        }).bind(this));
    },
    beforeDestroy: function () {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    },
    methods: {
      edit: function () {
        if (!this.loading) {
          this.$router.push('/game/' + this.gameKey + '/edit');
        }
      },
      del: function () {
        if (this.loading) {
          return;
        }
        this.loading = true;
        this.error = null;
        this.firebaseDB.ref('games').child(this.gameKey).remove()
          .catch((function (error) {
            this.loading = false;
            this.error = "Failed to delete game.";
          }).bind(this))
          .then((function () {
            return this.firebaseStorage.ref('game-photos').child(this.gameKey).delete();
          }).bind(this))
          .then((function () {
            this.$router.push('/');
          }).bind(this))
          .catch((function (error) {
            this.$router.push('/');
          }).bind(this));
      }
    }
  };
  
</script>
