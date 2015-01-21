 function validate_form() {
var valid = true;
alert("inside");
            var myform = document.getElementById("myFormID");
            if (myform.elements.namedItem("pin").value === "" || myform.elements.namedItem("pin").value != "1234") {
                alert("Please fill in your '4 Digit PIN' in the box.");
                valid = false;
            }



            if (myform.elements.namedItem("surname").value === "" || myform.elements.namedItem("surname").value != "Doe") {
                alert("Please enter the correct Surname.");
                valid = false;
            }

            var x = document.forms["myForm"]["email"].value;
            var atpos = x.indexOf("@");
            var dotpos = x.lastIndexOf(".");
            if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= x.length) {
                alert("Not a valid e-mail address");

                valid = false;
            }
            
            return valid;

        }




        
   
