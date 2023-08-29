import csv
import re
import string
from collections import defaultdict
import nltk
nltk.download('stopwords')
nltk.download('punkt')
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from wordcloud import WordCloud
import matplotlib.pyplot as plt
from collections import Counter


# Define a function to preprocess the text data
def preprocess(text):
    # Remove URLs, mentions, and hashtags
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'@\S+', '', text)
    text = re.sub(r'#\S+', '', text)
    # Remove punctuation and convert to lowercase
    text = text.translate(str.maketrans('', '', string.punctuation)).lower()
    # Tokenize the text and remove stopwords
    stop_words = set(stopwords.words('english'))
    stop_words.add('rt')
    tokens = word_tokenize(text)
    tokens = [token for token in tokens if token not in stop_words]
    # Stem the tokens
    # stemmer = PorterStemmer()
    # tokens = [stemmer.stem(token) for token in tokens]
    # Join the tokens back into a string
    text = ' '.join(tokens)
    return text

# Read the CSV file and extract the tweet data
tweets = []
tweets_freq = []
with open('./RawData/csv-1700-1830.csv', 'r', encoding='unicode_escape') as f:
    reader = csv.DictReader(f)
    for row in reader:
        text = preprocess(row['message'])
        #print(text)
        tweets_freq.extend(text.split())
        tweets.append(text)

with open('./RawData/csv-1831-2000.csv', 'r', encoding='unicode_escape') as f:
    reader = csv.DictReader(f)
    for row in reader:
        text = preprocess(row['message'])
        #print(text)
        tweets_freq.extend(text.split())
        tweets.append(text)

with open('./RawData/csv-2001-2131.csv', 'r', encoding='unicode_escape') as f:
    reader = csv.DictReader(f)
    for row in reader:
        text = preprocess(row['message'])
        #print(text)
        tweets_freq.extend(text.split())
        tweets.append(text)

#print(tweets_freq)
word_frequencies = Counter(tweets_freq)
#print(word_frequencies)
# Compute the TF-IDF scores using scikit-learn's TfidfVectorizer
vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(tweets)
feature_names = vectorizer.get_feature_names_out()
tfidf_scores = defaultdict(list)
for i, j in zip(*tfidf_matrix.nonzero()):
    tfidf_scores[i].append((feature_names[j], tfidf_matrix[i, j]))

with open('./WordCloudData/word_freq.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['word', 'frequency'])
    for k,v in word_frequencies.items():
        writer.writerow([k, v])

# Generate the word cloud for the top words across all tweets
word_scores = defaultdict(float)
for i, tweet in enumerate(tweets):
    for word, score in tfidf_scores[i]:
        word_scores[word] += score

with open('./WordCloudData/tfidf_scores.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['word', 'tfidf_score'])
    for (k,v) in word_scores.items():
        writer.writerow([k, v])

# Generate the word cloud using the top words and their scores
wordcloud = WordCloud(width=800, height=800, background_color='white', colormap='inferno')
wordcloud.generate_from_frequencies(word_scores)
plt.figure(figsize=(8,8), facecolor=None)
plt.imshow(wordcloud, interpolation="bilinear")
plt.axis("off")
plt.tight_layout(pad=0)
plt.show()
