import axios from 'axios';
import parseLink from 'parse-link-header';
import MockAxios from 'axios-mock-adapter';
import page1 from '../fixtures/issues/page1';
import page2 from '../fixtures/issues/page2';
import page3 from '../fixtures/issues/page3';
import page49 from '../fixtures/issues/page49';

let mock = new MockAxios(axios);

mock.onGet('https://api.github.com/repos/rails/rails/issues?per_page=25&page=1')
  .reply(200, page1.data, {link: page1.link});
mock.onGet('https://api.github.com/repos/rails/rails/issues?per_page=25&page=2')
  .reply(200, page2.data, {link: page2.link});
mock.onGet('https://api.github.com/repos/rails/rails/issues?per_page=25&page=3')
  .reply(200, page3.data, {link: page3.link});
mock.onGet('https://api.github.com/repos/rails/rails/issues?per_page=25&page=49')
  .reply(200, page49.data, {link: page49.link});

const isLastPage = (pageLinks) => {
  return Object.keys(pageLinks).length === 2 &&
    pageLinks.first && pageLinks.prev;
}

const getPageCount = (pageLinks) => {
  if(isLastPage(pageLinks)) {
    return parseInt(pageLinks.prev.page, 10) + 1;
  } else if(pageLinks.last) {
    return parseInt(pageLinks.last.page, 10)
  } else {
    return 0;
  }
}

export function getIssues(org, repo, page = 1) {
  const url = `https://api.github.com/repos/${org}/${repo}/issues?per_page=25&page=${page}`;
  return axios.get(url)
    .then(res => {
      const pageLinks = parseLink(res.headers.link);
      const pageCount = getPageCount(pageLinks);
      return {
        pageLinks,
        pageCount,
        data: res.data
      };
    })
    .catch(err => {
      return Promise.reject({
        pageLinks: {},
        pageCount: 0,
        data: [],
        error: err
      });
    });
}

export function getOpenIssueCount(org, repo) {
  const url = `https://api.github.com/repos/${org}/${repo}`;
  return axios.get(url)
    .then(res => {
      return res.data.open_issues_count;
    })
    .catch(err => {
      return Promise.reject(-1);
    });
}