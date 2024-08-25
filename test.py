# Imagine you are developing a feature for a social network to determine if a particular interest or post has been shared closely within the same neighborhood.
# Given a list of user posts as an integer array 'nums' and a distance 'k', your task is to check if there are two unique posts i and j in this array such that both posts are identical (i.e., nums[i] == nums[j]) and the absolute difference in their positions within the array is at most k.
# If such posts exist, return true; otherwise, return false.

# Example 1:
# Input: nums = [1,2,3,1], k = 3
# Output: true

# Example 2:
# Input: nums = [1,0,1,1], k = 1
# Output: true

# Example 3:
# Input: nums = [1,2,3,1,2,3], k = 2
# Output: false

# Constraints:
# - 1 <= nums.length <= 10^5
# - -10^9 <= nums[i] <= 10^9
# - 0 <= k <= 10^5

def checkNeighborhoodDuplicates(nums, k):
