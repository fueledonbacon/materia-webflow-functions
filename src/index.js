import React, { Component } from 'react'

import ReactDOM from 'react-dom'

class App extends Component {
    render() {
        return (
            <div>This is a React component inside of Webflow!</div>
        )
    }
}

ReactDOM.render(
    React.createElement(App, {}, null),
    document.getElementById('react-target')
);


/*
<script src="https://unpkg.com/react@15/dist/react.js"></script>
<script src="https://unpkg.com/react-dom@15/dist/react-dom.js"></script>

<script src="https://cdn.jsdelivr.net/gh/fueledonbacon/materia-webflow-functions@1c22e28/materia-functions.js" type="application/javascript"></script>

<script 
	type="text/babel" 
	src="https://cdn.jsdelivr.net/gh/fueledonbacon/materia-webflow-functions@1c22e28/materia-react.js">
</script>
*/