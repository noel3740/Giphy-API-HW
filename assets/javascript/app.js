$(document).ready(function() {

    var giphyDemo = {
        tempTopics: [],
        tempButtonsDiv: null,
        tempGifDisplayDiv: null,
        tempSearchForm: null,
        topicIndexAttribName: "topic-index",
        giphyAPIKey: "BhEB2InhZbmP96xsZoWBz15voVYxA47a", 

        initialize: function (searchTopics, buttonsDiv, gifDisplayDiv, searchForm) {
            this.tempTopics = [...searchTopics];
            this.tempButtonsDiv = buttonsDiv;
            this.tempGifDisplayDiv = gifDisplayDiv;
            this.tempSearchForm = searchForm;
            this.tempSearchForm.find("button").on("click", this.onSearchAddClick);
        },

        createTopicButtons: function() {
            giphyDemo.tempButtonsDiv.empty();
            
            giphyDemo.tempTopics.forEach((topic, index) => {
                var topicLabel = $("<label>")
                    .addClass("btn btn-primary")
                    .attr(giphyDemo.topicIndexAttribName, index);
                    
                var topicButton = $("<input>")
                    .attr({
                            "type": "radio", 
                            "name": "topic-options",
                            "autocomplete": "off"
                        });

                topicLabel.append(topicButton);
                topicLabel.append(" " + topic.toLowerCase());
                giphyDemo.tempButtonsDiv.append(topicLabel);

                topicLabel.on("click", giphyDemo.topicButtonClicked);
            });
        },

        topicButtonClicked: function() {

            //Get the index in the array of the button the user clicked on by grabbing it from the topic-index attribute on the button
            var topicIndex = $(this).attr(giphyDemo.topicIndexAttribName);
            //Get the string to search the Giphy API for using the index of the button the user clicked and replace spaces with a plus sign. 
            var searchFor = giphyDemo.tempTopics[topicIndex].replace(/ /gi, "+");
            //Get a random offset to get random pictures
            var randomOffset = Math.floor(Math.random() * 100) + 1;
            //Clear out the gif display div
            giphyDemo.tempGifDisplayDiv.empty();
             
            //Build the query url
            var queryURL = `https://api.giphy.com/v1/gifs/search?api_key=${giphyDemo.giphyAPIKey}&q=${searchFor}&offset=${randomOffset}&limit=10&lang=en`;

            //send a get request to the giphy url then build the gif image elements on the page. 
            $.ajax({
              url: queryURL,
              method: "GET"
            }).then(giphyDemo.buildGifImages);
           
        },

        buildGifImages: function(giphyResponse) {
            console.log(giphyResponse);

            giphyResponse.data.forEach((giphyDataObject) => {
                var originalStillImage = giphyDataObject.images.fixed_height_still;
                var original = giphyDataObject.images.fixed_height;

                var gifImageCard = $("<div>").addClass("card m-2");

                var gifDiv = $("<div>").addClass("gifImageContainer");
                gifDiv.on("click", giphyDemo.toggleGifAnimation);

                var giphyStillImage = $("<img>")
                    .attr({
                        "src": originalStillImage.url, 
                        "alt": giphyDataObject.title,
                        "height": originalStillImage.height,
                        "width": originalStillImage.width
                        })
                    .addClass("card-img-top");

                gifDiv.append(giphyStillImage);

                var giphyAnimatedImage = $("<img>")
                    .attr({
                            "src": original.url, 
                            "alt": giphyDataObject.title,
                            "height": original.height, 
                            "width": original.width
                        })
                    .addClass("card-img-top");
                    
                giphyAnimatedImage.hide();
                gifDiv.append(giphyAnimatedImage);

                gifImageCard.append(gifDiv);

                var cardBody = $("<div>").addClass("card-body");
                cardBody.append($("<p>")
                    .addClass("card-text text-center")
                    .text(`Rated ${giphyDataObject.rating.toUpperCase()}`));
                    
                gifImageCard.append(cardBody);

                giphyDemo.tempGifDisplayDiv.append(gifImageCard);
            });
        },

        toggleGifAnimation: function() {
            $(this).find("img").toggle();
        },

        onSearchAddClick: function () {
            event.preventDefault();
            var inputElement = giphyDemo.tempSearchForm.find("input");

            if (inputElement.val().trim() &&
                giphyDemo.tempTopics.indexOf(inputElement.val().toLowerCase()) < 0) {

                giphyDemo.tempTopics.push(inputElement.val().toLowerCase());
                giphyDemo.createTopicButtons();
            }

            inputElement.val("");
        }
    }

    var topics = ["baseball", "football", "basketball", "soccer", "hockey", "skateboarding", "surfing", 
    "tennis", "golf", "volleyball", "ping pong", "rugby", "boxing", "gymnastics", "Field Hockey "];

    giphyDemo.initialize(topics, $("#searchButtonsDiv"), $("#gifDisplayDiv"), $("#gifAddForm"));
    giphyDemo.createTopicButtons();
});