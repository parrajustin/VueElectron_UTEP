export default [
  {
    path: '/',
    name: 'window-page',
    component: require('components/WinView')
  },
  {
    path: '*',
    redirect: '/'
  }
]
