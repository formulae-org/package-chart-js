/*
Fōrmulæ chart package. Module for reduction.
Copyright (C) 2015-2023 Laurence R. Ugalde

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

'use strict';

export class Chart extends Formulae.Package {}

{
	let script = document.createElement("script");
	script.onload = () => {
		google.charts.load("current", { packages: [ 'corechart' ] });
	};
	script.src = "https://www.gstatic.com/charts/loader.js";
	document.head.appendChild(script);
}

Chart.Options = class extends CanonicalOptions {
	constructor() {
		super();
		this.width = 400;
		this.height = 300;
		this.title = null;
		this.seriesNames = null;
		this.horizontalDomain = true;
		this.stacking = null;
		this._3d = false;
		this.backgroundColor = null;
		this.legendPosition = "bottom";
		this.sliceText = "percentage";
		this.domainText = null;
		this.rangeText = null;
		this.logarithmicScale = null;
		this.starting = 1;
		this.dotSize = null;
	}
	
	checkOption(expression, option) {
		let name = option.children[0].get("Value").toLowerCase();
		let value = option.children[1];
		let tag = expression.getTag();
		
		switch (name) {
			case "size": {
				if (value.getTag() !== "List.List") {
					ReductionManager.setInError(value, "Value must be a list");
					return false;
				}
				
				if (value.children.length !== 2) {
					ReductionManager.setInError(value, "Value must be a two-element list");
					return false;
				}
				
				let w = CanonicalArithmetic.getNativeInteger(value.children[0]);
				if (w === undefined || w <= 0) {
					ReductionManager.setInError(value.children[0], "Value is not a valid number");
					return false;
				}
				
				let h = CanonicalArithmetic.getNativeInteger(value.children[1]);
				if (h === undefined || h <= 0) {
					ReductionManager.setInError(value.children[1], "Value is not a valid number");
					return false;
				}
				
				this.width = w;
				this.height = h;
				return true;
			}
			
			case "title": {
				if (value.getTag() !== "String.String") {
					ReductionManager.setInError(value, "Value is not a string");
					return false;
				}
				
				this.title = value.get("Value");
				return true;
			}
			
			case "domain text": {
				if (tag === "Chart.Pie") {
					ReductionManager.setInError(option, "Invalid option for the type of chart");
					return false;
				};
				
				if (value.getTag() !== "String.String") {
					ReductionManager.setInError(option, "Option is not a string");
					return false;
				}
				
				this.domainText = value.get("Value");
				return true;
			}
			
			case "range text": {
				if (tag === "Chart.Pie") {
					ReductionManager.setInError(option, "Invalid option for the type of chart");
					return false;
				};
				
				if (value.getTag() !== "String.String") {
					ReductionManager.setInError(option, "Option is not a string");
					return false;
				}
				this.rangeText = value.get("Value");
				return true;
			}
			
			case "3d": {
				if (tag !== "Chart.Pie") {
					ReductionManager.setInError(option, "Invalid option for the type of chart");
					return false;
				};
				
				tag = value.getTag();
				if (tag === "Logic.True" ||
					tag === "Logic.False"
				) {
					this._3d = tag === "Logic.True";
					return true;
				}
				
				ReductionManager.setInError(option, "Option is not a boolean value");
				return false;
			}
			
			case "series names": {
				if (tag === "Chart.Pie") {
					ReductionManager.setInError(option, "Invalid option for the type of chart");
					return false;
				};
				
				tag = value.getTag();
				if (tag.equals === "String.String") {
					this.seriesNames = value.get("Value"); 
					return true;
				}
				else if (tag === "List.List") {
					let n = value.children.length;
					if (n == 0) {
						ReductionManager.setInError(value, "Empty list");
						return false;
					}
					let ss = new Array(n);
					
					for (let i = 0; i < n; ++i) {
						if ((tag = value.children[i].getTag()) === "String.String") {
							ss[i] = value.children[i].get("Value");
						}
						else {
							ReductionManager.setInError(value.children[i], "Value is not a string");
							return false;
						}
					}
					
					this.seriesNames = ss;
					return true;
				}
				
				ReductionManager.setInError(option, "Invalid option");
				return false;
			}
			
			case "horizontal domain": {
				if (tag === "Chart.Pie") {
					ReductionManager.setInError(option, "Invalid option for the type of chart");
					return false;
				};
				
				tag = value.getTag();
				if (tag === "Logic.True" ||
					tag === "Logic.False"
				) {
					this.horizontalDomain = tag === "Logic.True";
					return true;
				}
				
				ReductionManager.setInError(option, "Option is not a boolean value");
				return false;
			}
			
			case "stacking": {
				if (tag === "Chart.Pie") {
					ReductionManager.setInError(option, "Invalid option for the type of chart");
					return false;
				};
				
				if (value.getTag() !== "String.String") {
					ReductionManager.setInError(option, "Expression is not a string");
					return false;
				}
				
				let s = value.get("Value").toLowerCase();
				
				switch (s) {
					case "none":
					case "absolute":
					case "relative":
						this.stacking = s;
						return true;
					
					default:
						ReductionManager.setInError(value, "Invalid option");
						return false;
				}
			}
			
			case "background color" : {
				tag = value.getTag();
				
				if (tag === "Null") {
					this.backgroundColor = "transparent";
					return true;
				}
				else if (tag === "Color.Color") {
					let r = Math.floor(option.get("Red")   * 255).toString(16);
					if (r.length === 1) r = "0" + r;
					
					let g = Math.floor(option.get("Green") * 255).toString(16);
					if (g.length === 1) g = "0" + g;
					
					let b = Math.floor(option.get("Blue")   * 255).toString(16);
					if (b.length === 1) b = "0" + b;
					
					this.backgroundColor = "#" + r + g + b;
					return true;
				}
				else {
					ReductionManager.setInError(value, "Invalid option");
					return false;
				}
			}
			
			case "legend position": {
				if (value.getTag() !== "String.String") {
					ReductionManager.setInError(value, "Value is not a string");
					return false;
				}
				
				let s = value.get("Value").toLowerCase();
				
				switch (s) {
					case "none":
					case "top":
					case "bottom":
					case "left":
					case "right":
						this.legendPosition = s;
						return true;
					
					case "beside slice":
						if (tag !== "Chart.Pie") {
							ReductionManager.setInError(value, "Invalid option for the type of chart");
							return false;
						}
						this.legendPosition = "labeled";
						return true;
					
					default:
						ReductionManager.setInError(value, "Invalid option");
						return false;
				}
			}
			
			case "slice text": {
				if (tag !== "Chart.Pie") {
					ReductionManager.setInError(value, "Invalid option for the type of chart");
					return false;
				};
				
				if (value.getTag() !== "String.String") {
					ReductionManager.setInError(value, "Expression is not a string");
					return false;
				}
				
				let s = value.get("Value").toLowerCase();
				
				switch (s) {
					case "none":
					case "percentage":
					case "value":
					case "label":
						this.sliceText = s;
						return true;
					
					default:
						ReductionManager.setInError(value, "Invalid option");
						return false;
				}
			}
			
			case "logarithmic scale": {
				if (tag === "Chart.Pie") {
					ReductionManager.setInError(value, "Invalid option for the type of chart");
					return false;
				};
				
				tag = value.getTag();
				if (tag === "Logic.True" ||
					tag === "Logic.False"
				) {
					this.logarithmicScale = tag === "Logic.True";
					return true;
				}
				
				ReductionManager.setInError(value, "Option is not a boolean value");
				return false;
			}
			
			case "starting": {
				let starting = CanonicalArithmetic.getNativeInteger(value);
				if (starting === undefined) {
					ReductionManager.setInError(value, "Value is not a valid number");
					return false;
				}
				
				this.starting = starting;
				return true;
			}
			
			case "dot size": {
				let size = CanonicalArithmetic.getNativeInteger(value);
				if (size === undefined) {
					ReductionManager.setInError(value, "Value is not a valid number");
					return false;
				}
				
				this.dotSize = size;
				return true;
			}
		}
		
		ReductionManager.setInError(option.children[0], "Unknown option");
		return false;
	}
}

Chart.getDataTable = (tag, data, chartOptions) => {
	let cols = Utils.isMatrix(data);
	
	if (cols <= 0) {
		if (data.getTag() !== "List.List") {
			ReductionManager.setInError(data, "Invalid data");
			return null;
		}
		
		let dataTable = new google.visualization.DataTable();
		dataTable.addColumn("number");
		if (chartOptions.seriesNames === null) {
			dataTable.addColumn("number");
		}
		else {
			dataTable.addColumn("number", chartOptions.seriesNames[c - 1]);
		}

		dataTable.addRows(data.children.length);
		
		let number;
		for (let r = 0, R = data.children.length; r < R; ++r) {
			try {
				number = data.children[r].evaluate();
				if (number <= 0 && (chartOptions.isPie || chartOptions.isLogarithmicScale)) {
					ReductionManager.setInError(
						data.children[r],
						"Non-positive value for " + (chartOptions.isPie ? "pie chart" : "logarithmic scale")
					);
					return null;
				}
				
				dataTable.setValue(r, 0, r + chartOptions.starting);
				dataTable.setValue(r, 1, number);
			}
			catch (error) {
				ReductionManager.setInError(data.children[r], "Value is not numeric");
				return null;
			}
		}
		
		return dataTable;
	}
	
	if (cols === 1) {
		ReductionManager.setInError(data, "Data has no series");
		return null;
	}
	
	if (chartOptions.seriesNames !== null && chartOptions.seriesNames.length !== cols - 1) {
		ReductionManager.setInError(data, "Series data and names do not match");
		return null;
	}
	
	let rows = data.children.length;
	let areCategoriesString = data.children[0].children[0].getTag() == "String.String";

	let isPie = tag === "Chart.Pie";
	let isLogarihmicScale = chartOptions.logarithmicScale === true;

	
	if (!areCategoriesString && isPie) {
		ReductionManager.setInError(data, "Pie chart must have non-numerical categories");
		return null;
	}
	
	let number;
	
	let dataTable = new google.visualization.DataTable();
	dataTable.addRows(rows);
	
	for (let r = 0; r < rows; ++r) {
		for (let c = 0; c < cols; ++c) {
			// add columns
			if (r == 0) {
				if (c == 0) {
					dataTable.addColumn(areCategoriesString ? "string" : "number");
				}
				else {
					if (chartOptions.seriesNames === null) {
						dataTable.addColumn("number");
					}
					else {
						dataTable.addColumn("number", chartOptions.seriesNames[c - 1]);
					}
				}
			}
			
			// values
			if (c == 0) {
				if (areCategoriesString) {
					if (data.children[r].children[0].getTag() == "String.String") {
						dataTable.setValue(r, 0, data.children[r].children[0].get("Value"));
					}
					else { // error
						ReductionManager.setInError(data.children[r].children[0], "Invalid type");
						return null;
					}
				}
				else { // numeric
					try {
						number = data.children[r].children[0].evaluate();
						if (number <= 0 && (chartOptions.isPie || chartOptions.isLogarithmicScale)) {
							ReductionManager.setInError(
								data.children[r].children[0],
								"Non-positive value for " + (chartOptions.isPie ? "pie chart" : "logarithmic scale")
							);
							return null;
						}
						
						dataTable.setValue(r, 0, number);
					}
					catch (error) {
						ReductionManager.setInError(data.children[r].children[0], "Value is not numeric");
						return null;
					}
				}
			}
			else { // always numeric
				try {
					number = data.children[r].children[c].evaluate();
					if (number <= 0 && (chartOptions.isPie || chartOptions.isLogarithmicScale)) {
						ReductionManager.setInError(
							data.children[r].children[c],
							"Non-positive value for " + (chartOptions.isPie ? "pie chart" : "logarithmic scale")
						);
						return null;
					}
					
					dataTable.setValue(r, c, number);
				}
				catch (error) {
					ReductionManager.setInError(data.children[r].children[c], "Value is not numeric");
					return null;
				}
			}
		}
	}
	
	return dataTable;
};

Chart.chart = async (chartExpression, session) => {
	let tag = chartExpression.getTag();
	
	let optionsExpr = chartExpression.children[1];
	let chartOptions = new Chart.Options();
	chartOptions.checkOptions(chartExpression, optionsExpr);
	
	let data = chartExpression.children[0];
	let dataTable = Chart.getDataTable(tag, data, chartOptions);
	if (dataTable === null) {
		return false;
	}
	
	let result = await new Promise(resolve => {
		let options = {
			//pointSize: 10,
			//pointShape: "square",
			
			width : chartOptions.width,
			height: chartOptions.height,
			enableInteractivity: false,
			backgroundColor: { strokeWidth: 1, stroke: "black" },
			legend: { alignment: "center" },
			hAxis: {},
			vAxis: {}
		};
		
		if (!chartOptions.horizontalDomain) {
			options.orientation = "vertical";
		}
		
		if (chartOptions.title !== null) {
			options.title = chartOptions.title;
		}
		
		if (chartOptions.stacking !== null) {
			options.isStacked = chartOptions.stacking;
		}
		
		if (tag === "Chart.Pie") {
			options.legend.position = chartOptions.legendPosition;
			options.pieSliceText = chartOptions.sliceText;
		}
		else {
			options.legend.position = chartOptions.seriesNames === null ? "none" : chartOptions.legendPosition;
		}
		
		if (chartOptions._3d) {
			options.is3D = true;
		}
		
		if (chartOptions.backgroundColor !== null) {
			options.backgroundColor.fill = chartOptions.backgroundColor;
		}
		
		if (chartOptions.domainText !== null) {
			options[chartOptions.horizontalDomain ? "hAxis" : "vAxis"].title = chartOptions.domainText;
		}
		
		if (chartOptions.rangeText !== null) {
			options[chartOptions.horizontalDomain ? "vAxis" : "hAxis"].title = chartOptions.rangeText;
		}
		
		if (chartOptions.logarithmicScale !== null) {
			options[chartOptions.horizontalDomain ? "vAxis" : "hAxis"].logScale = chartOptions.logarithmicScale;
		}
		
		if (chartOptions.dotSize !== null) {
			options.pointSize = chartOptions.dotSize;
		}
		
		//////////////////////////////////////////
		
		let div = document.createElement("div");
		//div.style.width = "400px";
		//div.style.height = "300px";
		div.style.position = "absolute";
		div.style.top = "-9999px";
		document.body.appendChild(div);
				
		let chart;
		
		switch (tag) {
			case "Chart.Bar":
				chart = new google.visualization.ColumnChart(div);
				break;
				
			case "Chart.Line":
				chart = new google.visualization.LineChart(div);
				break;
				
			case "Chart.Area":
				chart = new google.visualization.AreaChart(div);
				break;
				
			case "Chart.Dot":
				chart = new google.visualization.ScatterChart(div);
				break;
				
			case "Chart.Step":
				chart = new google.visualization.SteppedAreaChart(div);
				break;
				
			case "Chart.Pie":
				chart = new google.visualization.PieChart(div);
				break;
		}
		
		google.visualization.events.addListener(chart, 'ready', () => {
			let image = new Image();
			image.onload = () => {
				let canvas = document.createElement("canvas");
				canvas.width = chartOptions.width;
				canvas.height = chartOptions.height;
				let context = canvas.getContext("2d");
				
				context.drawImage(image, 0, 0);
				let result = Formulae.createExpression("Graphics.RasterGraphics");
				result.set("Value", context);
				
				div.remove();
				
				resolve(result);
			};
			image.src = chart.getImageURI();
		});
		chart.draw(dataTable, options);
	});
		
	chartExpression.replaceBy(result);
	return true;
};

Chart.setReducers = () => {
	ReductionManager.addReducer("Chart.Bar",  Chart.chart, "Chart.chart");
	ReductionManager.addReducer("Chart.Line", Chart.chart, "Chart.chart");
	ReductionManager.addReducer("Chart.Area", Chart.chart, "Chart.chart");
	ReductionManager.addReducer("Chart.Dot",  Chart.chart, "Chart.chart");
	ReductionManager.addReducer("Chart.Step", Chart.chart, "Chart.chart");
	ReductionManager.addReducer("Chart.Pie",  Chart.chart, "Chart.chart");
};
