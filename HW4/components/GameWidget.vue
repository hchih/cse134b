<!-- vim: set tw=99: -->

<template>
  <div class="gamewidget">
    <router-link :to="'/game/' + gameKey">
      <img v-if="photoUrl"
           width="150"
           height="150"
           :src="photoUrl"
           :alt="name"/>
    </router-link>
    <nav>
      <router-link :to="'/game/' + gameKey">{{ name }}</router-link>
      <ul>
        <li v-if="officialSite">
          <a :href="officialSite">Official Site</a>
        </li>
        <li v-if="amazonLink">
          <a :href="amazonLink">Amazon.com</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
  export default {
    props: ['firebaseStorage', 'gameKey', 'name', 'officialSite', 'amazonLink'],
    data: function () {
      return {
        photoUrl: null
      };
    },
    mounted: function () {
      this.firebaseStorage.ref('game-photos').child(this.gameKey).getDownloadURL()
        .then((function (url) {
          this.photoUrl = url;
        }).bind(this))
        .catch((function (error) {
          this.photoUrl = null;
        }).bind(this));
    }
  };
</script>
