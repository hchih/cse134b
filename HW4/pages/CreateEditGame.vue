<!-- vim: set tw=99: -->

<template>
  <form v-on:submit.prevent="save">
    <fieldset class="outer">
      <legend>Add Game</legend>
      <error-message v-if="error">{{ error }}</error-message>
      <label>
        <small>Name</small>
        <input type="text"
               required="required"
               :disabled="loading"
               v-model="name"/>
      </label>
      <label>
        <small>Photo</small>
        <input type="file"
               accept="image/x-png,image/gif,image/jpeg" 
               ref="photo"
               :disabled="loading"
               />
        <fieldset v-if="photoUrl"
             id="currentPhoto">
          <legend>Current Photo</legend>
          <img width="150"
               height="150"
               :src="photoUrl"
               :alt="name"/>
          <a :class="{ button: true, mini: true, decline: true, disabled: loading}"
             v-on:click.prevent="deletePhoto">
            Delete Photo
          </a>
        </fieldset>
      </label>
      <label>
        <small>Official Site</small>
        <input type="url"
               :disabled="loading"
               v-model="officialSite"/>
      </label>
      <label>
        <small>Amazon Link</small>
        <input type="url"
               :disabled="loading"
               v-model="amazonLink"/>
      </label>
      <fieldset class="inline">
        <label>
          <small>Player Count</small>
          <input type="number"
                 min="1"
                 ref="playerCountStart"
                 :disabled="loading"
                 v-model="playerCountStart"/>
        </label>
        <label>
          to
          <input type="number"
                 min="1"
                 ref="playerCountEnd"
                 :disabled="loading"
                 v-model="playerCountEnd"/>
        </label>
      </fieldset>
      <fieldset class="inline">
        <label>
          <small>Play Time</small>
          <input type="number"
                 min="1"
                 ref="playTimeStart"
                 :disabled="loading"
                 v-model="playTimeStart"/>
        </label>
        <label>
          to
          <input type="number"
                 min="1"
                 ref="playTimeEnd"
                 :disabled="loading"
                 v-model="playTimeEnd"/>
          hours
        </label>
      </fieldset>
      <label>
        <small>Genre</small>
        <select :disabled="loading"
                v-model="genre">
          <option v-bind:value="''">--</option>
          <option>Family</option>
          <option>Thematic</option>
          <option>Card-based</option>
          <option>Combat</option>
          <option>Social deducation</option>
        </select>
      </label>
      <label>
        <small>Difficulty Level</small>
        <select :disabled="loading"
                v-model="difficultyLevel">
          <option v-bind:value="''">--</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </label>
      <label>
        <small>Game Summary</small>
        <textarea :disabled="loading" v-model="gameSummary"></textarea>
      </label>
      <label>
        <small>Rules Summary</small>
        <textarea :disabled="loading" v-model="rulesSummary"></textarea>
      </label>
      <button class="mini primary"
              :disabled="loading">
        Save
      </button>
    </fieldset>
  </form>
</template>

<script>
  export default {
    props: ['firebaseAuth', 'firebaseDB', 'firebaseStorage', 'gameKey'],
    data: function () {
      return {
        unsubscribe: null,
        name: '',
        photoUrl: null,
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
        loading: false,
        error: null
      };
    },
    mounted: function () {
      this.unsubscribe = this.firebaseAuth.onAuthStateChanged((function (user) {
        if (!user) {
          this.$router.push('/login?next=' + escape(this.$route.path));
        }
      }).bind(this));

      if (this.gameKey) {
        this.loading = true;
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
            this.gameSummary = game.gameSummary;
            this.rulesSummary = game.rulesSummary;
          }).bind(this))
          .catch((function (error) {
            this.error = 'Loading game information failed.';
            window.scrollTo(0, 0);
          }).bind(this))
          .then((function () {
            return this.firebaseStorage.ref('game-photos').child(this.gameKey).getDownloadURL();
          }).bind(this))
          .then((function (url) {
            this.photoUrl = url;
            this.loading = false;
          }).bind(this))
          .catch((function (error) {
            this.photoUrl = null;
            this.loading = false;
          }).bind(this));
      }
    },
    beforeDestroy: function () {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    },
    methods: {
      save: function () {
        this.loading = true;
        this.error = null;

        var data = {
          name: this.name,
          officialSite: this.officialSite,
          amazonLink: this.amazonLink,
          playerCountStart: parseInt(this.playerCountStart) || '',
          playerCountEnd: parseInt(this.playerCountEnd) || '',
          playTimeStart: parseInt(this.playTimeStart) || '',
          playTimeEnd: parseInt(this.playTimeEnd) || '',
          genre: this.genre,
          difficultyLevel: this.difficultyLevel,
          gameSummary: this.gameSummary,
          rulesSummary: this.rulesSummary
        };

        var gamesRef = this.firebaseDB.ref('games');
        var gameRef;
        var promise;
        if (this.gameKey) {
          gameRef = gamesRef.child(this.gameKey);
          promise = gameRef.set(data);
        } else {
          gameRef = promise = gamesRef.push(data);
        }

        promise
          .then((function () {
            var photoFile = this.$refs.photo.files[0];
            if (photoFile) {
              var photoFileRef = this.firebaseStorage.ref('game-photos').child(gameRef.key);
              return photoFileRef.put(photoFile, { contentType: photoFile.type });
            }
          }).bind(this))
          .then((function () {
            this.$router.push('/game/' + escape(gameRef.key));
          }).bind(this))
          .catch((function (error) {
            this.loading = false;
            this.error = 'Saving failed.';
            window.scrollTo(0, 0);
          }).bind(this));
      },
      ensureRangeConsistency: function (start, end) {
        if (!this[start] && this[end]) {
          this.$refs[start].setCustomValidity('Specify both start and end, or neither');
        } else {
          this.$refs[start].setCustomValidity('');
        }

        if (this[start] && !this[end]) {
          this.$refs[end].setCustomValidity('Specify both start and end, or neither');
        } else {
          this.$refs[end].setCustomValidity('');
        }
      },
      deletePhoto: function () {
        if (!this.loading && this.gameKey) {
          this.loading = true;
          this.error = null;
          this.firebaseStorage.ref('game-photos').child(this.gameKey).delete()
            .then((function () {
              this.loading = false;
              this.photoUrl = null;
            }).bind(this))
            .catch((function (error) {
              this.loading = false;
              this.error = error.message;
              window.scrollTo(0, 0);
            }).bind(this));
        }
      }
    },
    watch: {
      playerCountStart: function (newValue) {
        this.ensureRangeConsistency('playerCountStart', 'playerCountEnd');
      },
      playerCountEnd: function (newValue) {
        this.ensureRangeConsistency('playerCountStart', 'playerCountEnd');
      },
      playTimeStart: function (newValue) {
        this.ensureRangeConsistency('playTimeStart', 'playTimeEnd');
      },
      playTimeEnd: function (newValue) {
        this.ensureRangeConsistency('playTimeStart', 'playTimeEnd');
      }
    }
  };
</script>
