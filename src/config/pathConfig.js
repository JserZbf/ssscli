export default {
  homePage1: {
    name: 'page',
    path: '/page',
    icon: 'shijianguanli',
  },
  router1: {
    name: 'router1',
    path: '/page/router1',
    icon: 'shijianguanli',
    component: '/page/router2',
  },
  router2: {
    name: 'router2',
    path: '/page/router2',
    icon: 'shijianguanli',
    component: '/page/router2',
  },
  login: {
    name: 'login',
    path: '/login',
    icon: 'shijianguanli',
    component:'/login'
  },
  default: {
    path: '/page',
  },
};
