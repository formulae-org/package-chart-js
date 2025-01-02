/*
Fōrmulæ chart package. Module for expression definition & visualization.
Copyright (C) 2015-2025 Laurence R. Ugalde

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

Chart.setExpressions = function(module) {
	// charts
	[ "Bar", "Line", "Area", "Dot", "Step", "Pie" ].forEach(tag => Formulae.setExpression(module, "Chart." + tag, {
		clazz:        Expression.Function,
		getTag:       () => "Chart." + tag,
		getMnemonic:  () => Chart.messages["mnemonic" + tag],
		getName:      () => Chart.messages["name" + tag],
		getChildName: index => Chart.messages.childrenChart[index],
		max: 2
	}));
};
