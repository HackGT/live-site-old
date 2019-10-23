<script>
    (function() {
        let tabs = document.querySelectorAll("li.tab");
        for (let i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener("click", displayTab);
        }

        function displayTab(e) {
            let activeSchedule = document.querySelector(".schedule-body.active");
            activeSchedule.classList.remove("active");

            let show = document.getElementById(e.target.dataset.div);
            show.classList.add("active");

            let activeTab = document.querySelector(".tab.active");
            activeTab.classList.remove("active");

            e.target.classList.add("active");
        }
    }) ();
</script>