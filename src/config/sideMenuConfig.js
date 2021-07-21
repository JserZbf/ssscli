import pathConfig from 'config/pathConfig';

const SideMenuConfig = [
  {
    name: pathConfig.homePage1.name,
    path: pathConfig.homePage1.path,
    id: pathConfig.homePage1.path,
    icon: pathConfig.homePage1.icon,
    children: [
      {
        name: pathConfig.router1.name,
        path: pathConfig.router1.path,
        id: pathConfig.router1.path,
        icon: pathConfig.router1.icon,
      },
      {
        name: pathConfig.router2.name,
        path: pathConfig.router2.path,
        id: pathConfig.router2.path,
        icon: pathConfig.router2.icon,
      },
    ],
  },
//   {
//     name: pathConfig.login.name,
//     path: pathConfig.login.path,
//     id: pathConfig.login.path,
//     icon: pathConfig.login.icon,
//   },
];

export default SideMenuConfig;
