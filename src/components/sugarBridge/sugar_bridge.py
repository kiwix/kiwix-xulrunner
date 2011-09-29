#!/usr/bin/env python
# encoding=utf-8

from xpcom import components, verbose

class SugarBridge:
    _com_interfaces_ = components.interfaces.ISugarBridge
    _reg_clsid_ = "{080787ae-ddff-11e0-aa79-000c2983f4e1}"
    _reg_contractid_ = "@kiwix.org/SugarBridge"
    def __init__(self):
        print("sugar bridge started")
        self.testAttr = "nop"

    def test(self):
        try:
            from sugar import env
            print(u"Activities: %s" % env.get_user_activities_path())
        except Exception as e:
            print(u"oops: %r" % e)

