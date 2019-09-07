# MMM-GoogleSheets
A MagicMirror² (https://magicmirror.builders) module to display Google Sheets information.

## Screenshots
![screenshot]()


## Installation
In your terminal, go to your MagicMirror's Module folder:
````
cd ~/MagicMirror/modules
````

Clone this repository:
````
git clone https://github.com/Prog-Party/MMM-GoogleSheets.git
````

Go to the modules folder:
````
cd MMM-GoogleSheets
````

Install the dependencies:
````
npm install
````

Add the module to the modules array in the `config/config.js` file:
````javascript
    {
        module: 'MMM-GoogleSheets'
    },
````

## Configuration
Add MMM-GoogleSheets to ../MagicMirror/config/config.js:

### Simple Version
```javascript
{
  module: "MMM-GoogleSheets",
  position: "top_right",
  config: {
    events: [
      {
      },
    ]
  }
},
```
### Configuration options

The following properties can be configured:


<table width="100%">
	<thead>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td><code>{Option}</code></td>
			<td>{Description}</td>
		</tr>
  </tbody>
</table>  
