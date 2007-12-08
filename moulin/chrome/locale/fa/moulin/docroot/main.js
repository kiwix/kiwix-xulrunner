function search() {
    q = document.getElementById("search-query").value;
    l = document.getElementById("lang").value;
    p = document.getElementById("project").value;
    d = document.getElementById("search-link");
    d.setAttribute("href", "moulin-search://"+p+"/"+l+"/"+q);
}
