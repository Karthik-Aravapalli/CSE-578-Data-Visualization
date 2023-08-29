import pandas as pd
from datetime import datetime

df1 = pd.read_csv("sentiments.csv")

# removing ccdata
df1 = df1[df1.type!='ccdata']

# removing neutral sentiments
df1 = df1[df1.sentiment!='neutral']

df2 = df1.drop(['type', 'author', 'message', 'sentiment_score'], axis=1)

df2["timestamp"] = pd.to_datetime(df2["timestamp"], format="%Y%m%d%H%M%S")
df2["timestamp"] = df2["timestamp"].dt.strftime("%H%M%S")

df3 = df2.groupby('timestamp')['sentiment'].value_counts().unstack(fill_value=0)

# preprocessed data without any coupling

# df3.to_csv("streamGraph_sentiments.csv", encoding='utf-8')

# combining timestamped data for 5 minute interval

df3 = df3.reset_index()

df3['timestamp'] = pd.to_datetime(df3['timestamp'], format='%H%M%S')
df3.set_index('timestamp', inplace=True)
df4 = df3.resample('5T').sum()
df4 = df4.reset_index()

df4['timestamp'] = pd.to_datetime(df4['timestamp'])
df4['timestamp'] =df4['timestamp'].dt.strftime('%H%M%S')

df4.to_csv("streamGraph_sentimentsFive.csv", encoding='utf-8', index=False)