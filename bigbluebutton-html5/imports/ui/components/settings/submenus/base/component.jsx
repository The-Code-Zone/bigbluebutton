import React from 'react';

export default class BaseMenu extends React.Component {
  constructor(props) {
    super(props);

    this.handleUpdateSettings = props.handleUpdateSettings;
  }

  getStorageOrDefault(key, defaultValue) {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return stored;
  }

  handleToggle(key) {
    const obj = this.state;
    obj.settings[key] = !this.state.settings[key];

    localStorage.setItem(key, obj.settings[key]);

    this.setState(obj, () => {
      this.handleUpdateSettings(this.state.settingsName, this.state.settings);
    });
  }

  handleInput(key, e) {
    const obj = this.state;
    obj.settings[key] = e.target.value;

    localStorage.setItem(key, obj.settings[key]);

    this.setState(obj, () => {
      this.handleUpdateSettings(this.state.settingsName, this.state.settings);
    });
  }


}
