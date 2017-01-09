import React, { Component } from 'react';
import './App.css';

import { firebase, firebaseListToArray } from './utils/firebase';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      names: []
    }
  }

  componentWillMount() {
    firebase.database()
      .ref('/names')
      .once('value', snapshot => {
        const results = firebaseListToArray(snapshot.val());
        console.log('snapshot', JSON.stringify(results));

        this.setState({
          names: results
        });
      });

    firebase.database()
      .ref('/names')
      .on('child_added', (data) => {
        const obj = data.val();
        obj.id = data.key;

        this.setState({
          names: this.state.names.concat([obj])
        })
      })

    firebase.database()
      .ref('/names')
      .on('child_removed', (data) => {
        const id = data.key;
        if (typeof(id) === 'undefined') return;

        const newState = this.state.names.filter(val => {
          return (val.id !== id);
        });

        this.setState({
          names: newState
        })
      })

    firebase.database()
      .ref('/names')
      .on('child_changed', (data) => {
        const id = data.key;
        if (!id) return;

        const newState = this.state.names.map(val => {
          if (val.id === id) {
            val = data.val()
            val['id'] = id;
          }

          return val;
        });

        this.setState({
          names: newState
        })
      })
  }

  handleSubmit(e) {
    e.preventDefault();
    const name = this.refs.name.value;

    firebase.database()
      .ref('/names')
      .push({
        name: name,
        count: 0
    }).then(() => {
      this.refs.name.value = '';
    });
  }

  handleCountClick(obj) {
    firebase.database()
      .ref(`/names/${ obj.id }`)
      .update({
        count: ++obj.count
      })
  }

  handleDeleteClick(obj) {
    firebase.database()
      .ref(`/names/${ obj.id }`)
      .remove();
  }

  render() {
    const names = (this.state.names) ? this.state.names : [];
    const items = names.map(obj => {
      return (
        <li key={ obj.id } id={ obj.id }>{ obj.name } &nbsp;
          <a href="#"
            onClick={ this.handleCountClick.bind(this, obj) }>{ obj.count }</a> &nbsp;
          <a href="#"
            onClick={ this.handleDeleteClick.bind(this, obj) }>Delete</a>
        </li>
      );
    });

    return (
      <div>
        <form onSubmit={ this.handleSubmit.bind(this) }>
        <input
          ref="name"
          type="text"
          placeholder="Add a name" />
        </form>
        <ul>
          { items }
        </ul>
      </div>
    );
  }
}

export default App;
