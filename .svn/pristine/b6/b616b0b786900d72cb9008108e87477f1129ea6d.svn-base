
function fnServiceCall(restfulUri,callBackMethod) {

	// make service call
        callService(restfulUri, callBackMethod);
}

    var restfulUri, employeeListFindAllUri, employeeByIdUri,
    callService, ajaxCallFailed,
    getEmployeeById, displayEmployeeList, displayEmployeeDetail;

    // Base URI of RESTful web service
    restfulUri = "http://localhost:8081/ParentConnect/rest/user/get";

    // Execute after the page one dom is fully loaded
    $(".one").ready(function () {


        // Attach onclick event to each row of employee list on page one
        $("#employeeList").on("click", "li", function(event){
            getEmployeeById($(this).attr("id").split("empId_").pop());
        });
    });

    // Call a service URI and return JSONP to a function
    callService = function (Uri, successFunction) {
        $.ajax({
            cache: true,
            url: Uri,
            data: "{}",
            type: "GET",
            contentType: "application/javascript",
            dataType: "json",
            error: ajaxCallFailed,
            failure: ajaxCallFailed,
            success: successFunction
        });
    };

    // Called if ajax call fails
    ajaxCallFailed = function (jqXHR, textStatus) {
        console.log("Error: " + textStatus);
        console.log(jqXHR);
        $("form").css("visibility", "hidden");
        $("#errorMessage").empty().
        append("Sorry, there was an error.").
        css("color", "red");
    };

    // Display employee list on page one
    displayEmployeeList = function (user) {
        var employeeList = "";
        $.each(user, function(index, user) {
            employeeList = employeeList.concat(
                "<li id=empId_" + user.userId.toString() + ">" + "<a href='#'>" +user.name.toString() + "</a>," +user.designation.toString()+"</li>");
        });

        $('#employeeList').empty();
        $('#employeeList').append(employeeList).listview("refresh", true);
    };


