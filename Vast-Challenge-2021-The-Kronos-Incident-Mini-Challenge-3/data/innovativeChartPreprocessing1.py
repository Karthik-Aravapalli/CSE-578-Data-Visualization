# this file merges all the 3 csv data files, removes the unwanted attributes and ccdata rows
import pandas as pd

tweets_df_1 = pd.read_csv("RawData/csv-1700-1830.csv", names=["type", "date(yyyyMMddHHmmss)", "author", "message", "latitude", "longitude", "location"], encoding= 'unicode_escape', header=0)
tweets_df_2 = pd.read_csv("RawData/csv-1831-2000.csv", names=["type", "date(yyyyMMddHHmmss)", "author", "message", "latitude", "longitude", "location"], encoding= 'unicode_escape', header=0)
tweets_df_3 = pd.read_csv("RawData/csv-2001-2131.csv", names=["type", "date(yyyyMMddHHmmss)", "author", "message", "latitude", "longitude", "location"], encoding= 'unicode_escape', header=0)

# merged_tweet_df = pd.concat([tweets_df_1])
merged_tweet_df = pd.concat([tweets_df_1, tweets_df_2, tweets_df_3])

# drop columns
temp_df = merged_tweet_df.drop(["latitude", "longitude", "location"], axis=1)

# filter out mbdata
mbdata_df = temp_df.loc[temp_df["type"] == "mbdata"]

# drop the type column
final_df = mbdata_df.drop("type", axis=1)

final_df = final_df.rename(columns={"date(yyyyMMddHHmmss)" : "time"})

final_df.to_csv('innovativeRawData.csv', index=False)