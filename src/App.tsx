import {
  Checkbox,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import React, { Component, Fragment } from 'react';
import styles from './App.module.css';

enum LS {
  VKU_IS_ENABLED = 'VKUIsEnabled',
  USERS = 'users'
}

interface IUser {
  id: number;
  isEnabled: boolean;
}

interface IState {
  isEnabled: boolean;
  users: IUser[];
  newId: string;
}

class App extends Component<{}, IState> {
  public state: Readonly<IState> = {
    isEnabled: true,
    users: [],
    newId: ''
  };

  public componentDidMount() {
    chrome.storage.sync.get([LS.VKU_IS_ENABLED], res => {
      const data = res[LS.VKU_IS_ENABLED];
      if (data === false || data === true) {
        this.setState({ isEnabled: data });
      }
    });
    chrome.storage.sync.get([LS.USERS], res => {
      const data = res[LS.USERS];
      if (Array.isArray(data)) {
        this.setState({ users: data });
      }
    });
  }

  public componentWillUnmount() {
    this.writeStorage();
  }

  public componentDidUpdate(prevProps: any, prevState: IState) {
    if (prevState !== this.state) {
      this.writeStorage();
    }
  }

  public render() {
    const { isEnabled, users } = this.state;
    return (
      <Fragment>
        <FormControlLabel
          label="Не читать ВСЕ диалоги"
          control={
            <Checkbox
              checked={this.state.isEnabled}
              onClick={this.toggleGlobal}
            />
          }
          checked={isEnabled}
        />
        <List>
          {users.map((user, index) => {
            const onToggle = () => this.toggleUser(index);
            const onRemove = () => this.removeUser(index);
            return (
              <ListItem key={index} className={styles.listItem} button>
                <ListItemText primary={user.id} />
                <ListItemSecondaryAction className={styles.btnWrapper}>
                  <IconButton
                    edge="end"
                    onClick={onRemove}
                    className={styles.deleteBtn}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Checkbox
                    edge="end"
                    onChange={onToggle}
                    checked={user.isEnabled}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
        <TextField
          label="VK ID"
          placeholder="1234567"
          margin="normal"
          type="text"
          inputProps={{ pattern: '^\\d{1,12}$' }}
          value={this.state.newId}
          onChange={this.onNewIdChange}
          onKeyDown={this.addUser}
        />
      </Fragment>
    );
  }

  private toggleGlobal = () => {
    this.setState(() => ({ isEnabled: !this.state.isEnabled }));
  };

  private toggleUser = (index: number) => {
    const { users } = this.state;
    const user = users[index];

    const newUser = {
      id: user.id,
      isEnabled: !user.isEnabled
    };
    const newUsers = [
      ...users.slice(0, index),
      newUser,
      ...users.slice(index + 1)
    ];
    this.setState({
      users: newUsers
    });
  };

  private removeUser = (index: number) => {
    const { users } = this.state;

    const newUsers = [...users.slice(0, index), ...users.slice(index + 1)];
    this.setState({
      users: newUsers
    });
  };

  private addUser = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const { users, newId } = this.state;
    if (e.keyCode === 13 && newId) {
      e.preventDefault();
      const newUser = {
        id: +newId,
        isEnabled: true
      };
      const newUsers = [...users, newUser];
      this.setState(() => ({
        users: newUsers,
        newId: ''
      }));
    }
  };

  private onNewIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.validity.valid) {
      this.setState({
        newId: e.currentTarget.value
      });
    }
  };

  private writeStorage = () => {
    chrome.storage.sync.set({
      [LS.VKU_IS_ENABLED]: this.state.isEnabled
    });

    chrome.storage.sync.set({
      [LS.USERS]: this.state.users
    });
  };
}

export default App;
