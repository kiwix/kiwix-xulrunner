#include "splitString.h"

std::vector<std::string> split(const std::string& myStr, const std::string& token) {
  std::vector<std::string> temp (0);
  std::string s;
  
  for (std::size_t i = 0; i < myStr.size(); i++) {
    if ((myStr.substr(i, token.size()).compare(token) == 0)) {
      temp.push_back(s);
      s.clear();
      i += token.size() - 1;
    } else {
      s.append(1, myStr[i]);
      if (i == (myStr.size() - 1))
	temp.push_back(s);
    }
  }

  return temp;
}

std::vector<std::string> split (const char* lhs, const char* rhs){
  const std::string m1 (lhs), m2 (rhs);
  return split(m1, m2);
}

std::vector<std::string> split (const char* lhs, const std::string& rhs){
  return split(lhs, rhs.c_str());
}

std::vector<std::string> split (const std::string& lhs, const char* rhs){
  return split(lhs.c_str(), rhs);
}
