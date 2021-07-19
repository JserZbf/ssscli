import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { withRouter } from 'react-router';
import { routerRedux } from 'dva/router';
import Iconfont from 'components/Iconfont';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { Menu, Badge } from 'antd';
import styles from './Category.less';

const { SubMenu } = Menu;

@withRouter
@connect(
  ({ baseLayout }) => ({
    sideMenus: baseLayout.sideMenus,
  }),
  (dispatch) => ({
    navTo: (payload) => dispatch(routerRedux.push(payload)),
  }),
)
class Category extends Component {
  constructor() {
    super();
    this.state = {
      openKeys: [],
      collapsed: false,
    };

    this.renderMenuItem = (item) => {
      const { navTo, showTrackingInfo } = this.props;
      const { id } = item;
      return (
        <Menu.Item
          key={id}
          onClick={() => {
            if (!id) {
              return;
            }
            navTo(id);
          }}
        >
          {item.icon ? (
            <Iconfont className={styles.menuIcon} type={item.icon || ''} iconMode="unicode" />
          ) : (
            <span className={styles.menuIcon}>&nbsp;</span>
          )}
          <span data-spm-event={item.name}>
            {showTrackingInfo ? (
              <Badge size="small" count={0} showZero offset={[10, 0]} overflowCount={999}>
                {item.name}
              </Badge>
            ) : (
              item.name
            )}
          </span>
        </Menu.Item>
      );
    };

    this.getOpenKeys = (sideMenuData, result = []) => {
      const {
        location: { pathname },
      } = this.props;
      const target = sideMenuData.find(
        (item) => pathname.includes(item.id) && item.id !== pathname,
      );
      if (target) {
        result.push(target.id);
        return this.getOpenKeys(target.subMenus || [], result);
      }
      return result;
    };
  }

  componentDidMount() {
    const {
      location: { pathname },
    } = this.props;
    setTimeout(() => {
      this.setState({ openKeys: pathname });
    }, 100);
  }

  componentDidUpdate(prevProps) {
    const {
      location: { pathname },
      sideMenus,
    } = this.props;
    const {
      location: { pathname: prePathname },
    } = prevProps;
    if (prePathname === pathname) return;
    setTimeout(() => {
      this.setState({ openKeys: this.getOpenKeys(sideMenus || []) });
    }, 100);
  }

  renderSideMenu(subMenus) {
    if (subMenus) {
      return (subMenus || []).map(this.renderMenuItem);
    }
    return [];
  }

  getSelectedKeys({ sideMenus, pathname }) {
    let target;
    for (let i = 0; i < sideMenus.length; ) {
      const item = sideMenus[i];
      target = this.findItem(item, pathname);
      if (target) {
        return [target.id];
      }
      i += 1;
    }
    target = sideMenus.find((item) =>
      this.findItem(item, pathname, (lItem, tValue) => {
        return (tValue || '').startsWith(lItem.id);
      }),
    );
    if (target) {
      return [target.id];
    }
    return [];
  }

  findItem(
    item,
    value,
    compare = (lItem, tValue) => {
      return lItem.id === tValue;
    },
  ) {
    const target = compare(item, value);
    if (target) return item;
    return (item.subMenus || []).find((i) => {
      return this.findItem(i, value, (lItem, tValue) => {
        return (tValue || '').startsWith(lItem.id);
      });
    });
  }

  render() {
    const { location, sideMenus } = this.props;
    const { pathname } = location;
    const { openKeys, collapsed } = this.state;
    return (
      <div className={styles.categoryContainer} data-spm-module="sideMenu">
        <div
          role="button"
          className={collapsed ? styles.toggleShrink : styles.toggleCollapsed}
          onClick={() => {
            this.setState({
              collapsed: !collapsed,
            });
          }}
        >
          <LegacyIcon className={styles.icon} type={collapsed ? 'menu-unfold' : 'menu-fold'} />
        </div>
        <Menu
          selectedKeys={this.getSelectedKeys({
            sideMenus,
            pathname,
          })}
          theme="dark"
          openKeys={openKeys}
          inlineIndent={12}
          onOpenChange={(keys) => {
            this.setState({ openKeys: keys });
          }}
          inlineCollapsed={collapsed}
          mode="inline"
          className={styles.menu}
        >
          {(sideMenus || []).map((item) => {
            if (!item.subMenus) {
              return this.renderMenuItem(item);
            }
            return (
              <SubMenu
                key={item.id}
                title={
                  <span>
                    {item.icon ? (
                      <Iconfont
                        className={styles.menuIcon}
                        type={item.icon || ''}
                        iconMode="unicode"
                      />
                    ) : (
                      <span className={styles.menuIcon}>&nbsp;</span>
                    )}
                    <span>{item.name}</span>
                  </span>
                }
              >
                {this.renderSideMenu(item.subMenus)}
              </SubMenu>
            );
          })}
        </Menu>
      </div>
    );
  }
}

export default Category;
