(function() {
	window.scoring = {
		determineGrade: function( distance ) {
			switch ( true ) {
				case distance < 100:
					return "A+";
				case distance < 250:
					return "A";
				case distance < 500:
					return "A-";
				case distance < 1000:
					return "B+";
				case distance < 2000:
					return "B";
				case distance < 3000:
					return "B-";
				case distance < 4500:
					return "C+";
				case distance < 6000:
					return "C";
				case distance < 7500:
					return "C-";
				case distance < 10000:
					return "D+";
				case distance < 15000:
					return "D";
				case distance < 20000:
					return "D-";
				default:
					return "E";
			}
		}
	};
}());
