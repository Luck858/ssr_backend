import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();

router.get('/leetcode', async (req, res) => {
  try {
    const { category = 'algorithms', limit = 50 } = req.query;

    const query = `
      query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
          categorySlug: $categorySlug
          limit: $limit
          skip: $skip
          filters: $filters
        ) {
          questions: data {
            acRate
            difficulty
            title
            titleSlug
            topicTags {
              name
              slug
            }
          }
        }
      }
    `;

    const variables = {
      categorySlug: category,
      limit: parseInt(limit),
      skip: 0,
      filters: {}
    };

    const response = await axios.post('https://leetcode.com/graphql', {
      query,
      variables
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      }
    });

    const problems = response.data.data.problemsetQuestionList.questions.map(q => ({
      title: q.title,
      url: `https://leetcode.com/problems/${q.titleSlug}/`,
      difficulty: q.difficulty,
      platform: 'LeetCode',
      acRate: q.acRate,
      tags: q.topicTags.map(t => t.name)
    }));

    res.json(problems);
  } catch (error) {
    console.error('LeetCode API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch LeetCode problems' });
  }
});

router.get('/codechef', async (req, res) => {
  try {
    const response = await axios.get('https://www.codechef.com/problems/school', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const problems = [];

    $('table.dataTable tbody tr').each((i, elem) => {
      const title = $(elem).find('td').eq(0).text().trim();
      const code = $(elem).find('td').eq(0).find('a').attr('href');
      const successRate = $(elem).find('td').eq(1).text().trim();

      if (title && code) {
        problems.push({
          title: title,
          url: `https://www.codechef.com${code}`,
          difficulty: 'School',
          platform: 'CodeChef',
          successRate: successRate
        });
      }
    });

    res.json(problems.slice(0, 50));
  } catch (error) {
    console.error('CodeChef scraping error:', error.message);
    res.status(500).json({ error: 'Failed to fetch CodeChef problems' });
  }
});

router.get('/hackerrank', async (req, res) => {
  try {
    const curatedProblems = [
      {
        title: 'Solve Me First',
        url: 'https://www.hackerrank.com/challenges/solve-me-first',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Simple Array Sum',
        url: 'https://www.hackerrank.com/challenges/simple-array-sum',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Compare the Triplets',
        url: 'https://www.hackerrank.com/challenges/compare-the-triplets',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'A Very Big Sum',
        url: 'https://www.hackerrank.com/challenges/a-very-big-sum',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Diagonal Difference',
        url: 'https://www.hackerrank.com/challenges/diagonal-difference',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Plus Minus',
        url: 'https://www.hackerrank.com/challenges/plus-minus',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Staircase',
        url: 'https://www.hackerrank.com/challenges/staircase',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Mini-Max Sum',
        url: 'https://www.hackerrank.com/challenges/mini-max-sum',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Birthday Cake Candles',
        url: 'https://www.hackerrank.com/challenges/birthday-cake-candles',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Time Conversion',
        url: 'https://www.hackerrank.com/challenges/time-conversion',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Grading Students',
        url: 'https://www.hackerrank.com/challenges/grading',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Apple and Orange',
        url: 'https://www.hackerrank.com/challenges/apple-and-orange',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Kangaroo',
        url: 'https://www.hackerrank.com/challenges/kangaroo',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Breaking the Records',
        url: 'https://www.hackerrank.com/challenges/breaking-best-and-worst-records',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Birthday Chocolate',
        url: 'https://www.hackerrank.com/challenges/the-birthday-bar',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Divisible Sum Pairs',
        url: 'https://www.hackerrank.com/challenges/divisible-sum-pairs',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Migratory Birds',
        url: 'https://www.hackerrank.com/challenges/migratory-birds',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Day of the Programmer',
        url: 'https://www.hackerrank.com/challenges/day-of-the-programmer',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Bon Appétit',
        url: 'https://www.hackerrank.com/challenges/bon-appetit',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      },
      {
        title: 'Sock Merchant',
        url: 'https://www.hackerrank.com/challenges/sock-merchant',
        difficulty: 'Easy',
        platform: 'HackerRank',
        category: 'Algorithms'
      }
    ];

    res.json(curatedProblems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch HackerRank problems' });
  }
});

export default router;
