var word_list = [];
var frequency_list = [];
var word_list_filter=[];
var frequency_list_filter=[];
var use_tf_idf = true;
var type='tfidf-btn';


document.addEventListener('DOMContentLoaded', function () {
  Promise.all([d3.csv('./data/WordCloudData/tfidf_scores.csv') , d3.csv('./data/WordCloudData/word_freq.csv')])
  .then(function(values){
    var tf_idf_scores = values[0];
    var word_freq_scores = values[1];

    tf_idf_scores.forEach(score => {
        word_list.push({
          text: score.word,
          weight: +score.tfidf_score,
          html: {"data-tooltip": score.tfidf_score}
        });
    });
    console.log("Data Loaded:", tf_idf_scores)
    word_list = word_list.sort((a, b) => b.weight - a.weight);
    word_list = word_list.slice(0, word_list.length/3 );

    word_freq_scores.forEach(score => {
      frequency_list.push({
        text: score.word,
        weight: +score.frequency,
        html: {"data-tooltip": score.frequency}
      });
    });
    frequency_list = frequency_list.sort((a, b) => b.weight - a.weight);
    frequency_list = frequency_list.slice(0, frequency_list.length/3);
    
    word_list_filter=word_list.slice(0,100);
    frequency_list_filter=frequency_list.slice(0,100);
    update_wordCloud(type);
  });
});

d3.select("#range").on('change', function(f)
{
  var selectedvalue = this.value;
  terms = selectedvalue
  word_list_filter=[]
  frequency_list_filter=[]
  //console.log('selected value:',terms)
  //console.log("Word list size before slice ",word_list.length)
  word_list_filter=word_list.slice(0,terms);
  frequency_list_filter=frequency_list.slice(0,terms);
  update_wordCloud(type);
});


function update_wordCloud(data){
  var graph_data=[]
  type=data
  if (type == 'tfidf-btn') {
      graph_data=word_list_filter
  }
  else if (type == 'freq-btn')
  {
      graph_data=frequency_list_filter
  }
  console.log('which is selected', graph_data)
  $("#wordCloud_svg").empty();
  $("#wordCloud_svg").jQCloud(graph_data, 
  {
      shape: "rectangular",
      autoResize: true
  });
}
