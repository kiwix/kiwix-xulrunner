//
//  zimReader.m
//  KiwixTest
//
//  Created by Chris Li on 8/1/14.
//  Copyright (c) 2014 Chris. All rights reserved.
//

#import "zimReader.h"

@implementation zimReader

- (id)initWithZIMFileURL:(NSURL *)url {
    self = [super init];
    if (self) {
        _reader = new kiwix::Reader([url fileSystemRepresentation]);
    }
    
    return self;
}

- (NSString *)htmlContentOfPageWithPageURL:(NSString *)pageURL {
    NSString *htmlContent = nil;
    
    string pageURLC = [pageURL cStringUsingEncoding:NSUTF8StringEncoding];
    string content;
    string contentType;
    unsigned int contentLength = 0;
    if (_reader->getContentByUrl(pageURLC, content, contentLength, contentType)) {
        htmlContent = [NSString stringWithUTF8String:content.c_str()];
    }
    
    return htmlContent;
}

- (NSString *)htmlContentOfMainPage {
    return [self htmlContentOfPageWithPageURL:self.mainPageURL];
}

- (NSString *)pageURLFromTitle:(NSString *)title {
    NSString *pageURL = nil;
    
    string url;
    if (_reader->getPageUrlFromTitle([title cStringUsingEncoding:NSUTF8StringEncoding], url)) {
        pageURL = [NSString stringWithUTF8String:url.c_str()];
    }
    
    return pageURL;
}

- (NSString *)mainPageURL {
    NSString *mainPageURL = nil;
    
    string mainPageURLC;
    mainPageURLC = _reader->getMainPageUrl();
    mainPageURL = [NSString stringWithCString:mainPageURLC.c_str() encoding:NSUTF8StringEncoding];
    
    return mainPageURL;
}

- (NSString *)getTitle {
    NSString *title = nil;
    
    string titleC;
    titleC = _reader->getTitle();
    title = [NSString stringWithCString:titleC.c_str() encoding:NSUTF8StringEncoding];
    
    return title;
}

- (NSString *)getDate {
    NSString *date = nil;
    
    string dateC;
    dateC = _reader->getDate();
    date = [NSString stringWithCString:dateC.c_str() encoding:NSUTF8StringEncoding];
    
    return date;
}

- (void)dealloc {
    _reader->~Reader();
    delete _reader;
}
@end
