# Python packages
import re
import pandas as pd
from textblob import TextBlob

# NLTK packages
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# download stopword corpus
nltk.download('stopwords')

tweets_df_1 = pd.read_csv("RawData/csv-1700-1830.csv", names=["type", "date(yyyyMMddHHmmss)", "author", "message", "latitude", "longitude", "location"], encoding= 'unicode_escape', header=1)
tweets_df_2 = pd.read_csv("RawData/csv-1831-2000.csv", names=["type", "date(yyyyMMddHHmmss)", "author", "message", "latitude", "longitude", "location"], encoding= 'unicode_escape', header=1)
tweets_df_3 = pd.read_csv("RawData/csv-2001-2131.csv", names=["type", "date(yyyyMMddHHmmss)", "author", "message", "latitude", "longitude", "location"], encoding= 'unicode_escape', header=1)

print(tweets_df_1)
print(tweets_df_2)
print(tweets_df_3)


merged_tweet_df = pd.concat([tweets_df_1, tweets_df_2, tweets_df_3])

# remove URLs and other mentions from the tweets
def remove_mentions(tweet):
    tweet = re.sub(r"http\S+", "", tweet)
    tweet = re.sub(r"@\S+", "", tweet)
    return tweet

# remove special characters and lowercase the tweet
def clean_tweet(tweet):
    tweet = re.sub(r"[^\w\s]", "", tweet)
    tweet = tweet.lower()
    return tweet

# remove stopwords from the tweet
def remove_stopwords(tweet):
    stop_words = set(stopwords.words("english"))
    words = word_tokenize(tweet)
    filtered_tweet = [word for word in words if word.casefold() not in stop_words]
    return ' '.join(filtered_tweet)


# classify sentiment of each tweet
def get_sentiment(tweet):
    blob = TextBlob(tweet)
    sentiment = blob.sentiment.polarity

    if sentiment > 0.3:
        return "happy"
    elif sentiment <= 0.3 and sentiment > 0:
        return "anxious"
    elif sentiment < 0 and sentiment > -0.3:
        return "sad"
    elif sentiment <= -0.3:
        return "angry"
    else:
        return "neutral"


# assign sentiment score
def assign_sentiment_score(sentiment):
    if sentiment == "happy":
        return 5
    elif sentiment == "anxious":
        return 4
    elif sentiment == "neutral":
        return 3
    elif sentiment == "sad":
        return 2
    elif sentiment == "angry":
        return 1



merged_tweet_df["processed_message"] = merged_tweet_df["message"].apply(remove_mentions)
merged_tweet_df["processed_message"] = merged_tweet_df["processed_message"].apply(clean_tweet)
merged_tweet_df["processed_message"] = merged_tweet_df["processed_message"].apply(remove_stopwords)
merged_tweet_df["sentiment"] = merged_tweet_df["processed_message"].apply(get_sentiment)
merged_tweet_df["sentiment_score"] = merged_tweet_df["sentiment"].apply(assign_sentiment_score)

merged_tweet_df = merged_tweet_df.rename(columns={"date(yyyyMMddHHmmss)" : "timestamp"})
final_tweets_df = merged_tweet_df[["type", "timestamp", "author", "message", "sentiment", "sentiment_score"]]

print(merged_tweet_df)

final_tweets_df.to_csv("sentiments.csv", index=False)