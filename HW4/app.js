// vim: set tw=99:

import firebase from 'firebase'

import Vue from 'vue'
import VueRouter from 'vue-router'

import ErrorMessage from './components/ErrorMessage.vue'
import GameWidget from './components/GameWidget.vue'
import GoogleAuth from './components/GoogleAuth.vue'
import SiteWrapper from './components/SiteWrapper.vue'

import CreateEditGame from './pages/CreateEditGame.vue'
import Login from './pages/Login.vue'
import Register from './pages/Register.vue'
import ViewGame from './pages/ViewGame.vue'
import WelcomeMessage from './pages/WelcomeMessage.vue'

firebase.initializeApp({
  apiKey: "AIzaSyDx1V06mUh9TEkFKruu27Sp_lbD-suaRBE",
  authDomain: "boardgamedex.firebaseapp.com",
  databaseURL: "https://boardgamedex.firebaseio.com",
  storageBucket: "boardgamedex.appspot.com",
  messagingSenderId: "794160666192"
});

var firebaseAuth = firebase.auth();
var firebaseDB = firebase.database();
var firebaseStorage = firebase.storage();

var routes = [
  {
    path: '/',
    component: SiteWrapper,
    props: { firebaseAuth: firebaseAuth },
    children: [
      {
        path: '',
        component: WelcomeMessage,
        props: { firebaseAuth: firebaseAuth }
      },
      {
        path: '/played',
        component: WelcomeMessage,
        props: { firebaseAuth: firebaseAuth }
      },
      {
        path: '/planned',
        component: WelcomeMessage,
        props: { firebaseAuth: firebaseAuth }
      },
      {
        path: '/collection',
        component: WelcomeMessage,
        props: { firebaseAuth: firebaseAuth }
      },
      {
        path: '/wishlist',
        component: WelcomeMessage,
        props: { firebaseAuth: firebaseAuth }
      },
      {
        path: '/invitations',
        component: WelcomeMessage,
        props: { firebaseAuth: firebaseAuth }
      },
      {
        path: 'login',
        component: Login,
        props: function (route) {
          return {
            firebaseAuth: firebaseAuth,
            next: route.query.next || '/'
          };
        }
      },
      {
        path: 'register',
        component: Register,
        props: function (route) {
          return {
            firebaseAuth: firebaseAuth,
            next: route.query.next || '/'
          };
        }
      },
      {
        path: 'add-game',
        component: CreateEditGame,
        props: {
          firebaseAuth: firebaseAuth,
          firebaseDB: firebaseDB,
          firebaseStorage: firebaseStorage
        }
      },
      {
        path: 'game/:gameKey',
        component: ViewGame,
        props: function (route) {
          return {
            firebaseAuth: firebaseAuth,
            firebaseDB: firebaseDB,
            firebaseStorage: firebaseStorage,
            gameKey: route.params.gameKey
          };
        }
      },
      {
        path: 'game/:gameKey/edit',
        component: CreateEditGame,
        props: function (route) {
          return {
            firebaseAuth: firebaseAuth,
            firebaseDB: firebaseDB,
            firebaseStorage: firebaseStorage,
            gameKey: route.params.gameKey
          };
        }
      }
    ]
  }
];

var router = new VueRouter({
  routes: routes
});

Vue.use(VueRouter);

Vue.component('error-message', ErrorMessage);
Vue.component('game-widget', GameWidget);
Vue.component('google-auth', GoogleAuth);

var app = new Vue({
  el: '#app',
  router: router
});
